const pixelmatch = require('pixelmatch')
const PNG = require('pngjs').PNG
const fs = require('fs')
const parentModule = require('parent-module')
const path = require('path')

// currying everywhere, that allows us to create one setup and then use tester without copying config each time
const ScreenTestFactory = function(threshold = 0.1, includeAA = false) {
  // get path to called directory
  // cannot use __directory because it returns module directory instead of caller
  const folderPath = path.dirname(parentModule())
  return new Promise( resolve => {
    resolve(async (page, name = 'test') => {
      // we need that to pixelmatch and creating diff
      const {width, height} = page.viewport()

      // get existing image, might return undefined
      const oldImage = await getOldImageData(folderPath, name)

      // get page object from puppeteer and create screenshot without path to receive Buffer
      const screenShot = await page.screenshot({})
      if (oldImage !== undefined) {
        // if there is old image we can compare it with current screenshot
        const diff = new PNG({width, height})
        const testPng = PNG.sync.read(screenShot)

        // call pixelmatch with three objects and dimensions with options
        // (newImage, oldImage, emptyDiff, widthInPX, heightInPX, options)
        const missMatchedPixels = pixelmatch(testPng.data, oldImage.data, diff.data, width, height, {threshold, includeAA})

        // missMatchedPixels is number of pixels that differs between two images
        // 0 means that images are the same
        if (missMatchedPixels > 0) {
          // save diff to test folder with '-diff' postfix
          diff.pack().pipe(fs.createWriteStream(`${folderPath}/${name}-diff.png`))
        }
        // returns boolean value if test passes
        return missMatchedPixels === 0
      } else {
        // if there is no old image we cannot compare two images so just write existing screenshot as default image
        fs.writeFileSync(`${folderPath}/${name}.png`, screenShot)
        console.log('There was nothing to compare, current screes saved as default')
        return true
      }
    })
  })
}

// returns promise which resolves with undefined or PNG object
const getOldImageData = function(folderPath, name = 'test') {
  return new Promise((resolve) => {
    fs.stat(`${folderPath}/${name}.png`, (error) => {
      if (error) {
        // if there is an error resolve with undefined
        resolve()
      } else {
        // if file exists just get file and pipe it into PNG
        fs.readFile(`${folderPath}/${name}.png`, (err, data) => {
          if (err || !data instanceof Buffer) {
            resolve()
          } else {
            const generatedPNG = PNG.sync.read(data)
            resolve(generatedPNG)
          }
        })
      }
    })
  })
}

module.exports = ScreenTestFactory