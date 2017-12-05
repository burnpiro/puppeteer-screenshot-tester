const puppeteer = require( 'puppeteer')
const ScreenTest = require('../src/index')

describe('google test', () => {
  let originalTimeout

  beforeEach(function() {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
  })

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
  })

  it(`check if google exists`, async () => {
    const tester = await ScreenTest()
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport({width: 1920, height: 1080})
    await page.goto('https://www.google.com', { waitUntil: 'networkidle0' })
    await page.type('#lst-ib', 'Hello', { delay: 100 });
    console.log('prepare to start test')
    await tester(page, 'test2')
    await browser.close()
  })
})
