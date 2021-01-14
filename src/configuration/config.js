module.exports = {
    /**
     * {BASE_URL}: URL where your Tango is Hosted
     * must end with slash
     */
    baseURL: 'https://www.google.com:8080/',
    /**
     * {USER_NAME}: Username of a Tango+, recommended to use their default Users
     */
    userName: "myUserName",
    /**
     * {PASSWORD}: Password of a Tango+ User
     */
    password: "myUserPassword",
    /**
     * {IS_HEADLESS}: Run Your Test in HEADLESS Mode ,
     * true: Run in background
     * false: View actions perform on browser
     */
    isHeadless: false,
    VIEW_PORT: "1920,870",
    /**
     * {Integer} slow the motion of your execution
     */
    slowMo: 10,
    /**
     * {IS_DEVELOPER_TOOL}: 
     * true:show developer tool with your each action 
     */
    isDevtools: false,
    /**
     * {LAUNCH_TIMEOUT}: Timeout in which Puppeteer Launch its browser 
     * must be in milliseconds
     */
    launchTimeout: 180000,
    /**
     * {WAITING_TIMEOUT}: Timeout used in  WaitForSelector 
     * must be in milliseconds
     */
    waitingTimeout: 60000,
    /**
     * {NAVIGATION_TIMEOUT}: Timeout used for navigation between the pages and new URL's 
     * must be in milliseconds
     */
    navigationTimeOut: 180000,
    RUN_BY: {
        LIBRARY: "puppeteer",
        BROWSER: "chrome",
    },
    TEMP_FILES_DIRECTORY: "tempScreenShots/",
}
