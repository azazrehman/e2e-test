/**
 *
 */
const fsExtra = require('fs-extra')
const path = require('path')
const fs = require('fs')
const config = require('../configuration/config')
const process = require('process'); 
const deleteFolderRecursive = function (directory) {
	console.log('Cleaning Old Directories')
	if (fsExtra.existsSync('tempScreenShots')) {
		fsExtra.emptyDirSync('tempScreenShots')
		console.log('Screenshot Folder Cleaned')
	} else {
		fsExtra.mkdirSync('tempScreenShots')
	}
	if (fsExtra.existsSync('allure-results')) {
		fsExtra.emptyDirSync('allure-results')
		console.log('Report results folder cleaned')
	}
	if (fs.existsSync(directory)) {
		fs.readdirSync(directory).forEach((file, index) => {
			const curPath = path.join(directory, file)
			if (fs.lstatSync(curPath).isDirectory()) {
				// recurse
				deleteFolderRecursive(curPath)
			} else {
				// delete file
				fs.unlinkSync(curPath)
			}
		})
		fs.rmdirSync(directory)
	}
	console.log('Old expected benchmarks deleted')
}
//Delete All Downloaded Files
try {
    let directory = `${config.testDataPath}outputs`
    let fileName=process.title
        fileName=`SequentialMode`
        deleteFolderRecursive(directory)
        fsExtra.mkdirSync(directory)
        console.log(`Created New BenchMark directory ${directory}`)
      
    
    try {
        log4js.configure({
            appenders: { myLogs: { type: "file", filename: `logs/${fileName}.log` } },
            categories: { default: { appenders: ["myLogs"], level: "ALL" } }
        });
        log4js = log4js.getLogger("default");
    } catch (error) {
        console.log(error)
    }
} catch (error) {
	console.error('Unable to Setup the pre-req ' + error)
}



