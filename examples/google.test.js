const puppeteer = require('puppeteer')
const ScreenshotTester = require('../src/index')

describe('google test', () => {
  let originalTimeout

  // extend default interval to 10s because some image processing might take some time
  // we can do it beforeEach or once per test suite it's up to you
  // if you're running that on fast computer/server probably won't need to do that
  beforeEach(function() {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000
  })

  // set default interval timeout for jasmine
  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
  })

  it(`check if google exists`, async () => {
    // create ScreenshotTester with optional config
    const tester = await ScreenshotTester(0.1, false, false, [], {
      transparency: 0.5
    })

    // setting up puppeteer
    const browser = await puppeteer.launch({headless: false})
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
