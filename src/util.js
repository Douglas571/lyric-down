const got = require('got')
const fs = require('fs')
const path = require('path')
const colors = require('colors')

async function getHtml(url) {
  let req = got(url)
  
  setTimeout(() => {
    req.cancel()
  }, 60000)
  

  try {
    console.log(`Searching ${url}`.yellow)
    let res = await req;
    const { body } = res;
    console.log('downloaded:' + url)
    console.log(body.slice(0, 25))
    return body
  } catch(err) {
    console.log(colors.red(err.message))
    if(req.isCanceled) {
      console.log('the reques is canseled and resend:'.red + url)
      return await getHtml(url)
    }
  }
}

exports.getHtml = getHtml;

exports.getMultipleHtmlFiles = async function(listOfUrl) {

  console.log(listOfUrl)

  const listOfPromises = listOfUrl.map( url => getHtml(url))
  const listOfResults = await Promise.allSettled(listOfPromises)
  const listOfHtml = listOfResults.map(({ value }) => value)

  return listOfHtml.map((html, idx) => {
    console.log('in multiple'.yellow)
    console.log(colors.red(html.slice(0, 25)))
    return { html, url: listOfUrl[idx]}
  });
}

exports.readPage = function (file) {
  return fs.readFileSync(file, 'utf-8')
}