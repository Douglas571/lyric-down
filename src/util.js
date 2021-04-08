const got = require('got')
const fs = require('fs')
const path = require('path')

async function getHtml(url) {
  let req = got(url)
  
  setTimeout(() => {
    req.cancel()
  }, 15000)
  
  try {
    let res = await req;
    const { body } = res;
    console.log('downloaded:' + url)
    return body
  } catch(err) {
    if(req.isCanceled) {
      console.log('the reques is canseled and resend:'.red + url)
      return await getHtml(url)
    }
  }
}

exports.getHtml = getHtml;

exports.getMultipleHtmlFiles = async function(listOfUrl) {
  const listOfPromises = listOfUrl.map( url => getHtml(url))
  const listOfResults = await Promise.allSettled(listOfPromises)
  const listOfHtml = listOfResults.map(({ value }) => value)

  return listOfHtml.map((html, idx) => {
    return { html, url: listOfUrl[idx]}
  });
}

exports.readPage = function (file) {
  return fs.readFileSync(file, 'utf-8')
}