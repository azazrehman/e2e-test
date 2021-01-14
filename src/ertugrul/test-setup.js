const puppeteer = require('puppeteer')
const { chromium, firefox, webkit } = require('playwright')
const { expect } = require('chai')
const config = require('./../configuration/config')
const _ = require('lodash')
const fs = require('fs')
const globalVariables = _.pick(global, [
	'browser',
	'expect',
	'log4js',
	'report',
	'fs',
	'testLevel',
	'myGIF',
	'emoji',
	'puppeteer',
])
const testLevel = require('../constants/report')
require('mocha-allure-reporter')
const myGIF = require('gif-creation-service')
const emoji = require('node-emoji')
const log4js = require('log4js')
global.log4js = log4js
module.exports = {
	jiraLogFile: null,
	browserLaunchOptions: {
		headless: config.isHeadless,
		slowMo: config.slowMo,
		devtools: config.isDevtools,
		timeout: config.launchTimeout,
		defaultViewport: config.defaultViewport,
		viewport: config.defaultViewport,
		setViewportSize: config.defaultViewport,
		args: [
			'--start-maximized',
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			`--window-size=${config.VIEW_PORT}`,
		],
	},
}
const beforeSuite = require('./beforeTest')

before(async () => {
	//global.expect = expect
	global.fs = fs
	global.testLevel = testLevel
	global.report = true //true for allure false for mocahawesome
	global.myGIF = myGIF
	global.emoji = emoji
	global.puppeteer = puppeteer

	if (config.RUN_BY.LIBRARY.localeCompare('puppeteer') == 0) {
		config.RUN_BY.LIBRARY = true
		global.browser = await puppeteer.launch(module.exports.browserLaunchOptions)
	} else {
		config.RUN_BY.LIBRARY = false
		if (config.RUN_BY.BROWSER.localeCompare('firefox') == 0) {
			global.browser = await firefox.launch(module.exports.browserLaunchOptions)
		} else {
			global.browser = await chromium.launch(
				module.exports.browserLaunchOptions
			)
			global.browser = await global.browser.newContext({ viewport: null })
		}
	}
})
after(async () => {
	try {
		await browser.close()
		global.browser = globalVariables.browser
		global.expect = globalVariables.expect
	} catch (error) {
		console.error(error)
	}
})