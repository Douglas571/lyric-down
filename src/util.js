const got = require('got')
const fs = require('fs')
const path = require('path')

async function getPage(url) {
  let req = got(url)
  
  setTimeout(() => {
    req.cancel()
  }, 40000)
  

  try {
    let res = await req;
    const { body } = res;
    console.log('downloaded:' + url)
    return body
  } catch(err) {
    if(req.isCanceled) {
      console.log('the reques is canseled and resend'.red)
      return await getPage(url)
    }
  }

}

function readPage(file) {
  return fs.readFileSync(file, 'utf-8')
}

module.exports = { readPage }