const pixelmatch = require('pixelmatch')
const PNG = require('pngjs').PNG
const fs = require('fs')
const parentModule = require('parent-module')
const path = require('path')


const ScreenTestFactory = function(threshold = 0.1, includeAA = false) {
  const folderPath = path.dirname(parentModule())
  return new Promise( resolve => {
    resolve(async (page, name = 'test') => {
      console.log(folderPath);
      const {width, height} = page.viewport()
      // console.log(width, height)
      const oldImage = await getOldImageData(folderPath, name)
      // console.log(typeof oldImage)
      const screenShot = await page.screenshot({})
      // console.log(screenShot)
      if (oldImage !== undefined) {
        const diff = new PNG({width, height})
        // console.log(diff)
        const testPng = PNG.sync.read(screenShot)
        const missMatchedPixels = pixelmatch(testPng.data, oldImage.data, diff.data, width, height, {threshold});
        console.log(missMatchedPixels)
        // console.log(diff)
        return missMatchedPixels > 0
      } else {
        // console.log(screenShot)
        fs.writeFileSync(`${folderPath}/${name}.png`, screenShot)
      }
    })
  })
}

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