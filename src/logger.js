const Winston = require('winston');
const path = require('path');
const fse = require('fs-extra')
const os = require('os')

const defaultDir = path.join(os.homedir(), 'my-app')

function getLogger(rootDir = defaultDir, logFolder = 'log') {

  const logDir = path.join(rootDir, logFolder)
  const filename = path.join(logDir, 'loggin.txt')

  fse.ensureDirSync(logDir)

  const logger = Winston.createLogger({
    transports: [
      //new Winston.transports.Console(),
      new Winston.transports.File({ filename })
    ],
  });

  return logger
}


exports.getInstance = getLogger