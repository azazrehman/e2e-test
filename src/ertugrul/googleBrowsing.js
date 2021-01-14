const config = require("./../configuration/config");
const myHelper = require("./../lib/browserApiWrapper");
const pageObjects = require("./../constants/pageObjects/googlePage");

describe("Google Browsing", async () => {
  let page;
  before(async function () {
    // Creating a Browser Page with some Specifc settings
    page = myHelper.createPage(page);
    // Load a URL
    await myHelper.loadUrl(page, config.baseURL);
  });
  after(async function () {
    try {
      await page.close();
    } catch (error) {
      console.log("Error While Page Close | " + error);
    }
  });
  afterEach(async function () {
    log4js.info(
      "Test Finished: " +
        this.currentTest.title +
        " --> " +
        this.currentTest.state +
        (this.currentTest.isPassed()
          ? ` ${emoji.get(":white_check_mark:")}`
          : ` ${emoji.get(":x:")}`)
    );
  });

  it("Open Google Page", async () => {
    try {
        //Verify Google Logo is Visile, Verify 
        await myHelper.shouldExist(page, pageObjects.LOGO_IMAGE, 10000);
    } catch (error) {
      console.log(error);
      await page.emit("error", new Error(error));
    }
  });
});
