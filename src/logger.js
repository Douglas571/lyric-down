const Winston = require('winston');
const path = require('path');

function getLogger(rootDir, logFolder = 'log') {

  const filename = path.join(rootDir, logFolder, 'loggin.txt')

  const logger = Winston.createLogger({
    tranports: [
      new Winston.tranports.Console(),
      new Winston.tranports.File({ filename })
    ],
  });

  return 
}


module.exports = getLogger;