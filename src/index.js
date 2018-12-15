const resemble = require('node-resemble-js');
const fs = require('fs');
const parentModule = require('parent-module');
const path = require('path');

// currying everywhere, that allows us to create one setup and then use tester without copying config each time
const ScreenTestFactory = function(
  threshold = 0,
  includeAA = false,
  ignoreColors = false,
  ignoreRectangles = [],
  errorSettings = {
    errorColor: {
      red: 255,
      green: 0,
      blue: 255
    },
    errorType: 'flat',
    transparency: 0.7
  }) {
  resemble.outputSettings(errorSettings);
  // get path to called directory
  // cannot use __directory because it returns module directory instead of caller
  const folderPath = path.dirname(parentModule());
  return new Promise( resolve => {
    resolve(async (page, name = 'test', screenshotOptions = {}) => {
      let saveFolder = folderPath;
      let ext = '.png';
      if(screenshotOptions.path != null) {
        const puppeteerExt = path.extname(screenshotOptions.path);
        const puppeteerPath = path.dirname(screenshotOptions.path);
        const puppeteerFileName = path.basename(screenshotOptions.path, puppeteerExt);

        if(typeof puppeteerFileName === 'string' && puppeteerFileName.length > 0 && typeof puppeteerPath === 'string' && puppeteerPath.length > 0) {
          saveFolder = puppeteerPath;
          name = puppeteerFileName;
          ext = puppeteerExt || '.png';
        }
        delete screenshotOptions.path;
      }
      // get existing image, might return undefined
      const oldImage = await getOldImageData(saveFolder, name, ext);

      // get page object from puppeteer and create screenshot without path to receive Buffer
      const screenShot = await page.screenshot(screenshotOptions);
      if (oldImage !== undefined) {
        // call comparison between images
        const comparisonResult = resemble(screenShot)
          .compareTo(oldImage);

        // Add extra options if specified
        if (!includeAA) {
          comparisonResult.ignoreAntialiasing()
        }
        if (ignoreColors) {
          comparisonResult.ignoreColors()
        }
        if (ignoreRectangles.length > 0) {
          comparisonResult.ignoreRectangles(ignoreRectangles)
        }

        // await for a comparison to be completed and return resolved value
        return await new Promise(resolve => {
          comparisonResult.onComplete((data) => {
              // check if images are the same dimensions and mismatched pixels are below threshold
              if (data.isSameDimensions === false || Number(data.misMatchPercentage) > threshold) {
                // save diff to test folder with '-diff' postfix
                data.getDiffImage().pack().pipe(fs.createWriteStream(`${saveFolder}/${name}-diff${ext}`));

                // optionally save the new image to the test directory
                if (screenshotOptions.saveNewImageOnError) {
                  fs.writeFileSync(`${saveFolder}/${name}-new${ext}`, screenShot);
                }

                resolve(false)
              } else {
                resolve(true)
              }
            });
        });
      } else {
        // if there is no old image we cannot compare two images so just write existing screenshot as default image
        fs.writeFileSync(`${saveFolder}/${name}${ext}`, screenShot);
        console.log('There was nothing to compare, current screens saved as default');
        return true;
      }
    })
  })
}

// returns promise which resolves with undefined or PNG object
const getOldImageData = function(folderPath, name = 'test', ext = 'png') {
  return new Promise((resolve) => {
    fs.stat(`${folderPath}/${name}${ext}`, (error) => {
      if (error) {
        // if there is an error resolve with undefined
        resolve();
      } else {
        // if file exists just get file and pipe it into PNG
        fs.readFile(`${folderPath}/${name}${ext}`, (err, data) => {
          if (err || !data instanceof Buffer) {
            resolve();
          } else {
            resolve(data);
          }
        })
      }
    })
  })
}

module.exports = ScreenTestFactory
