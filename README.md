puppeteer-screenshot-tester
---------------------------

[![node](https://img.shields.io/badge/node-8.9.x-brightgreen.svg)]()
[![yarn](https://img.shields.io/badge/yarn-1.x-brightgreen.svg)]()

Small library that allows us to compare screenshots generated by puppeteer in our tests.

Installation
--------------
To use Puppeteer Screenshot Tester in your project, run:
```
yarn add --dev puppeteer-screenshot-tester
```

or

```
npm install --save-dev puppeteer-screenshot-tester
```

Usage
-------------
Require the `puppeteer-screenshot-tester` library:

```js
const ScreenshotTester = require('puppeteer-screenshot-tester')
```

### Initialise Screenshot Tester

```js
const tester = await ScreenshotTester()
```

#### Optional arguments:
```js
const tester = await ScreenshotTester(
  [threshold = 0][, includeAA = false[, ignoreColors = false[, ignoreRectangles = [] [, errorSettings = Object]]]]
)
```

- `threshold` <[number]> A threshold value <0,1> default set to 0, max ratio of difference between images
- `includeAA` <[boolean]> Should include anti aliasing?
- `ignoreColors` <[boolean]> Should ignore colors?
- `ignoreRectangles` <[Array<Array[x, y, width, height]>]> Should ignore rectangles? example: `[[325,170,100,40], [10,10,200,200]]`
- `errorSettings` <[Object]> change how to display errors (errorType: `flat` | `movement` | `flatDifferenceIntensity` | `movementDifferenceIntensity` | `diffOnly`):
    ```
    {
      errorColor: {
        red: 255,
        green: 0,
        blue: 255
      },
      errorType: 'flat',
      transparency: 0.7
    }
    ```
- returns: <[function]> resolves to function

### Run the test

```js
const result = await tester(page)
```

#### Required arguments:
- `page` <[BrowserPage]> BrowserPage returned by puppeteer when calling `puppeteer.launch().newPage()`

#### Optional arguments:
```js
const result = await tester(page[, name = 'test'[, screenshotOptions = {}]])
```

- `name` <[string]> name of created screenshot 'test' by default
- `screenshotOptions` <[Object]> options passed to Puppeteer's screenshot method [See the Puppeteer documentation for more info](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagescreenshotoptions), _plus_ the following keys:
  - `saveNewImageOnError`: <[boolean]> saves the undiffed new image on error as `${saveFolder}/${name}-diff${ext}`

#### Returns
- <[boolean]> true if images are the same or there is no image to compare (first run)

Examples
----------------

```javascript
const puppeteer = require('puppeteer')
const ScreenshotTester = require('puppeteer-screenshot-tester')

describe('google test', () => {
  let originalTimeout

  // extend default interval to 10s because some image processing might take some time
  // we can do it beforeEach or once per test suite it's up to you
  // if you're running that on fast computer/server probably won't need to do that
  beforeEach(function() {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
  })

  // set default interval timeout for jasmine
  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
  })

  it(`check if google exists`, async () => {
    // create ScreenshotTester with optional config
    const tester = await ScreenshotTester(0.8, false, false, [], {
      transparency: 0.5
    })

    // setting up puppeteer
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport({width: 1920, height: 1080})
    await page.goto('https://www.google.com', { waitUntil: 'networkidle0' })
    await page.type('input[title="Search"]', 'Hello', { delay: 100 })

    // call our tester with browser page returned by puppeteer browser
    // second parameter is optional it's just a test name if provide that's filename
    const result = await tester(page, 'test2', {
      fullPage: true,
    })
    await browser.close()

    // make assertion result is always boolean
    expect(result).toBe(true)
  })
})
```

## Contributors

Thanks goes to these wonderful people :sunglasses: :

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars0.githubusercontent.com/u/3284639?v=4" width="100px;"/><br /><sub><b>Kemal Erdem</b></sub>](https://github.com/burnpiro)<br />[💻](https://github.com/burnpiro/puppeteer-screenshot-tester/commits?author=burnpiro "Code") [📖](https://github.com/burnpiro/puppeteer-screenshot-tester/commits?author=burnpiro "Documentation") [👀](#review-burnpiro "Reviewed Pull Requests") | [<img src="https://avatars0.githubusercontent.com/u/3769985?v=4" width="100px;"/><br /><sub><b>Max Harris</b></sub>](https://github.com/maxharris9)<br />[🐛](https://github.com/burnpiro/puppeteer-screenshot-tester/issues?q=author%3Amaxharris9 "Bug reports") [💻](https://github.com/burnpiro/puppeteer-screenshot-tester/commits?author=maxharris9 "Code") | [<img src="https://avatars2.githubusercontent.com/u/426677?v=4" width="100px;"/><br /><sub><b>Andi Smith</b></sub>](http://www.andismith.com)<br />[📖](https://github.com/burnpiro/puppeteer-screenshot-tester/commits?author=andismith "Documentation") [⚠️](https://github.com/burnpiro/puppeteer-screenshot-tester/commits?author=andismith "Tests") |
| :---: | :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!