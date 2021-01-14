/**
 * This File contains wrapper functions for PlayWright and Puppeteer API
 */
const config = require('./../configuration/config');
const waits = require('./../constants/waits');
const delay = require('delay')
module.exports = {
    /**
    * Click on Any Element
    * 
    * @param  {DOM} page - page or a frame in which your selector exist which you want to click
    * @param  {string} selector - A selector which you want to click
    * @param  {string} button - the mouse button which you want to triger, default button is left
    * @param  {Object} options - If you pass options Argument it override all existing options.
    * @return {void} Nothing
    */
    click: async function (page, selector, button, options) {
        try {
            if (selector.startsWith('//') || (selector.startsWith('(//'))) {//Handle XPath
                await module.exports.click_xPath(page, selector)
            }
            else {
                await page.waitForSelector(selector, { timeout: config.waitingTimeout })
                await page.focus(selector)
                if (options != undefined) {
                    await page.click(selector, options)
                }
                else if (button != undefined) {
                    await page.click(selector, { button: `${button}` })
                }
                else {
                    await page.click(selector)
                }
            }
        } catch (error) {
            log4js.error(`Could not click on selector: ${selector}  Detail Error:` + error)
            throw new Error(`Could not click on selector: ${selector}  Detail Error:` + error)
        }
        finally {
            try {
                await module.exports.takeScreenShot(page)
            } catch (error) { }
        }
    },
    clickWithNavigate: async function (page, selector, button) {
        try {
            await Promise.all([
                module.exports.click(page, selector, button),
                page.waitForNavigation({ waitUntil: waits.networks.NETWORK_IDEAL_0/*,timeout:0*/ })
            ])
        } catch (error) {
            if (error.code === 'PPTR_TIMEOUT') {
                log4js.warn('Error While Navigating(Timeout): ' + error)
                console.log('Error While Navigating(Timeout): ' + error)
            }
            else {
                console.log('Error While Navigating: ' + error)
            }
        } finally {
            await module.exports.takeScreenShot(page)
        }
    },
    /**
    * Type a text on Any input type Element
    * 
    * @param  {DOM} page - page or a frame in which your selector exist and you want to type text in that
    * @param  {string} text - sequences of characters which you want to type
    * @param  {string} selector - A selector in which you want to type
    * @param  {number} myDelay - delay in typing the text on given selector, default delay is 80 milisecond
    * @param  {boolean} eventDispatch - If typing is not work properly you can set this flag as true and then try
    */
    typeText: async function (page, text, selector, myDelay, eventDispatch = false) {
        try {
            if (myDelay == undefined) {
                myDelay = 80
            }
            if (eventDispatch && !selector.startsWith('//')) {
                await page.waitForSelector(selector, { timeout: config.waitingTimeout }),
                    await page.evaluate((selector, text) => {
                        const inputElement = document.querySelector(selector);
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                        nativeInputValueSetter.call(inputElement, text);
                        const ev2 = new Event('input', { bubbles: true });
                        inputElement.dispatchEvent(ev2);
                    }, selector, text); 
            }
            else {
                if (selector.startsWith('//') || (selector.startsWith('(//'))) {//Handle XPath
                    await module.exports.typeTextXPath(page, text, selector)
                }
                else {
                    await page.waitForSelector(selector, { timeout: config.waitingTimeout }),
                        await Promise.all([
                            page.focus(selector),
                            page.click(selector, { clickCount: 3 }),
                        ]).catch(function (error) {
                            throw new Error(`Could not type text into selector: ${selector} -> ${error}`)
                        });
                    await page.type(selector, text, { delay: myDelay })
                }
            }
        } catch (error) {
            log4js.error(`Could not type text into selector: ${selector} -> ${error}`)
            throw new Error(`Could not type text into selector: ${selector} -> ${error}`)
        } finally {
            await module.exports.takeScreenShot(page)
        }
    },
    /**
     * Load A Given URL
     * @param {*} page 
     * @param {*} url 
     */
    loadUrl: async function (page, url) {
        await page.goto(url, { waitUntil: waits.networks.NETWORK_IDEAL_0 })
    },
    /**
    * Get a text from DOM Element
    * 
    * @param  {DOM} page - page or a frame in which your selector exist and you want to type text in that
    * @param  {string} selector - A selector whose inside HTML text you want to retrieve
    * @return {string} inside text of an given HTML element
    */
    getText: async function (page, selector, textOnly) {
        try {
            await page.waitForSelector(selector, { timeout: config.waitingTimeout })
            if (textOnly) {

                return page.$eval(selector, e => e.innerText)
            }
            return page.$eval(selector, e => e.innerHTML)
        } catch (error) {
            log4js.error(`Cannot get text from selector: ${selector}`)
            throw new Error(`Cannot get text from selector: ${selector}`)
        }
    },
    /**
     * Get a text from DOM Element
     * 
     * @param  {DOM} page - page or a frame in which your selector exist and you want to type text in that
     * @param  {string} selector - xPath of element whose value is required
     */
    getValue: async function (page, selector) {
    try {
        await page.waitForSelector(selector, { timeout: config.waitingTimeout }) 
        return await page.$eval(selector, selectedValue=> selectedValue.value)
    } catch (error) {
        log4js.error(`Cannot get value from xPath: ${selector}`)
        throw new Error(`Cannot get value from xPath: ${selector}`)
    }
    },
    /**
    * Get a Value of Attribute from DOM Element
    * 
    * @param  {DOM} page - page or a frame in which your selector exist and you want to type text in that
    * @param  {string} selector - A selector whose inside HTML text you want to retrieve
    * @return {string} inside text of an given HTML element
    */
    getAttributeValue: async function (page, selector, attributeName) {
        try {
            await page.waitForSelector(selector)
            const name = await page.evaluate(el => el.getAttribute(attributeName), selector);
            return name
        } catch (error) {
            log4js.error(`Cannot get text from selector: ${selector}`)
            throw new Error(`Cannot get text from selector: ${selector}`)
        }
    },
    /**
    * Click on Any XPATH Element
    * 
    * @param  {DOM} page - page or a frame in which your selector exist which you want to click
    * @param  {string} selector - A XPATH selector which you want to click
    */
    click_xPath: async function (page, selector) {//TODO remove all click_xPath explicitly calls 
        try {
            if (config.RUN_BY.LIBRARY) {
                await page.waitForXPath(selector, { timeout: config.waitingTimeout });
                const [button] = await page.$x(selector);
                await Promise.all([
                    button.click(),
                ]);
            }
            else {
                await module.exports.click(page, selector)
            }

        } catch (error) {
            log4js.error(`Could not click on the XPath: ${selector} ` + error)
            throw new Error(`Could not click on the XPath: ${selector} ` + error);
        } finally {
            await module.exports.takeScreenShot(page)
        }
    },
    /**
    * Get Number of count of given Element
    * 
    * @param  {DOM} page - page or a frame in which your selector exist which you want to click
    * @param  {string} selector - A selector which you want to count
    * @return {number} total given HTML element at given page or frame
    */
    getCount: async function (page, selector) {
        try {
            await page.waitForSelector(selector)
            return page.$$eval(selector, items => items.length)
        } catch (error) {
            throw new Error(`Cannot get count of selector: ${selector}`)
        }
    },
    /**
     * Press Any key from Keyboard to Page or frame and release key
     * 
     * @param  {DOM} page - page or a frame in which your selector exist which you want to click
     * @param  {string} key - A key which u want to press like (1 or 2 or Tab etc)
     * @return {Void} Nothing
     */
    pressKey: async function (page, key) {
        try {
            await page.keyboard.press(key)
        } catch (error) {
            log4js.error(`Could not press key: ${key} on the keyboard`)
            throw new Error(`Could not press key: ${key} on the keyboard`)
        }
    },
    /**
     * 
     * @param {DOM} page - Broswer Pge where your slector exist 
     * @param {string} selector- Selector value which you want to hover
     * @param {number} index- element No. which you want to hover, default value is 0 point to first element
     */
    hover: async function (page, selector, index = 0) {
        try {
            if (selector.startsWith('//')) {
                await page.waitForXPath(selector)
                let element = await page.$x(selector)
                await element[index].focus(element)
                await element[index].hover()
            }
            else {
                await page.waitForSelector(selector)
                await page.hover(selector)
            }
        } catch (error) {
            log4js.error(`Could not Hover on Selector ${selector}-> ${error}`)
            throw new Error(`Could not Hover on Selector ${selector}-> ${error}`)
        }
    },
    /**
   * 
   * @param {DOM} page - Broswer Pge where your slector exist 
   * @param {string} selector- Selector value which you want to hover
   */
    hoverXPath: async function (page, selector, timeOut) {
        try {
            if (config.RUN_BY.LIBRARY) {
                await page.waitForXPath(selector)
                await page.hover(selector)
            }
            else {
                await page.waitForSelector(selector)
                await page.hover(selector)
            }

        } catch (error) {
            log4js.error(`Could not Hover on Selector ${selector}-> ${error}`)
            throw new Error(`Could not Hover on Selector ${selector}-> ${error}`)
        }
    },
    /**
    * Make sure given element exist on a page or frame if not it throw error
    * 
    * @param  {DOM} page - page or a frame in which you check your selector exist
    * @param  {string} selector - A selector which u want to verify it exist on page or frame
    * @return {boolean} true
    */
    shouldExist: async function (page, selector, timeOut) {
        try {
            if (timeOut == null) {
                if (config.RUN_BY.LIBRARY) {
                    await page.waitForSelector(selector)
                } else {
                    await page.waitForSelector(selector, { waitFor: "visible" })
                }
            }
            else {
                if (config.RUN_BY.LIBRARY) {
                    await page.waitForSelector(selector, { timeout: timeOut })
                } else {
                    await page.waitForSelector(selector, { waitFor: "visible", timeout: timeOut })
                }
            }
            return true
        } catch (error) {
            log4js.error(`Unable to find following selector ${selector} ${error}`)
            throw new Error(`Unable to find following selector ${selector} ${error}`)
        } finally {
            await module.exports.takeScreenShot(page)
        }
    },
    /**
    * Make sure given XPATH element exist on a page or frame if not it throw error
    * 
    * @param  {DOM} page - page or a frame where selector u want to findt
    * @param  {string} selector - A XPATH selector which u want to verify it exist on page or frame
    * @param  {number} timeOut - timeOut Value to wait maximum for given selector
    * @return {Void} Nothing
    */
    shouldExistXPath: async function (page, selector, timeOut) {
        try {
            if (config.RUN_BY.LIBRARY) {
                await page.waitForXPath(selector, { timeout: timeOut })
            }
            else {
                await page.waitForSelector(selector, { timeout: timeOut })
            }

        } catch (error) {
            log4js.error(`Xpath Selector: ${selector} not exist withing given timeout ${timeOut}`)
            throw new Error(`Xpath Selector: ${selector} not exist withing given timeout ${timeOut}`)
        } finally {
            await module.exports.takeScreenShot(page)
        }
    },
    /**
    * Make sure given element can't exist on a page or frame if exist return true
    * 
    * @param  {DOM} page - page or a frame where selector u want to findt
    * @param  {string} selector - A  selector which u want to verify it not exist on page or frame
    * @param  {number} timeOut - timeOut Value to wait maximum for given selector
    * @return {boolean} false
    */
    shouldNotExist: async function (page, selector, timeOut, options) {
        let myError = `Element ${selector} is Visible`
        try {
            if (timeOut == null) {
                await page.waitForSelector(selector)
            }
            else {
                await page.waitForSelector(selector, { timeout: timeOut, visible: true })
            }
            throw (myError)
        } catch (error) {
            if (error === myError) {
                log4js.error(error)
                throw new Error(error)
            }
            else {
                return true
            }
        } finally {
            await module.exports.takeScreenShot(page)
        }
    },
    /**
   * Make sure given element can't exist on a page or frame if exist return true
   * 
   * @param  {DOM} page - page or a frame where selector u want to findt
   * @param  {string} selector - A  selector which u want to verify it not exist on page or frame
   * @param  {number} timeOut - timeOut Value to wait maximum for given selector
   * @return {boolean} false
   */
    shouldNotExistXPath: async function (page, selector, timeOut, options) {
        let myError = `Element ${selector} is Visible`
        try {
            if (timeOut == null) {
                await page.waitForXPath(selector)
            }
            else {
                await page.waitForXPath(selector, { timeout: timeOut, visible: true })
            }
            throw (myError)
        } catch (error) {
            if (error === myError) {
                log4js.error(error)
                throw new Error(error)
            }
            else {
                return true
            }
        } finally {
            await module.exports.takeScreenShot(page)
        }
    },
    /**
     * Function that creates a Page(Open a Tab) in a launched browser
     * {browser} it takes launch browser as a parameter and return its new page
     */
    createPage: async function (browser) {
        let page
        try {
            page = await browser.newPage()
            await page.setDefaultNavigationTimeout(config.navigationTimeOut)
            await page.setDefaultTimeout(config.navigationTimeOut)
            page.on('dialog', async dialog => {
                await dialog.accept();
            });
            return page
        } catch (error) {
            throw new Error(error)
        }
    },
}//end of wrapper functions for PlayWright and Puppeteer API