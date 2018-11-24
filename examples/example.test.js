const puppeteer = require('puppeteer')
const ScreenshotTester = require('puppeteer-screenshot-tester')

describe('example test', () => {
  let originalTimeout

  // extend default interval to 10s because some image processing might take some time
  // we can do it beforeEach or once per test suite it's up to you
  // if you're running that on fast computer/server probably won't need to do that
  beforeEach(() => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000
  })

  // set default interval timeout for jasmine
  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
  })

  it(`check if example page looks the same`, async () => {
    // create ScreenshotTester with optional config
    const tester = await ScreenshotTester(0.8, false, false, [], {
      transparency: 0.5
    })

    // setting up puppeteer
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
    await page.goto('https://example.com', { waitUntil: 'networkidle0' })

    // call our tester with browser page returned by puppeteer browser
    const screenshotsPath = '../screenshots';
    const result = await tester(page, screenshotsPath + '/test2', {
      fullPage: true
    })
    // Above code will look at compare the current page with '../screenshots/test2.png' make sure screenshots folder exists!
    // If there are no image in the given path, it will recreate one.

    await browser.close()

    // make assertion result is always boolean
    expect(result).toBe(true)
  })
})
