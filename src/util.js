const got = require('got')
const fs = require('fs')
const path = require('path')
const colors = require('colors')

async function getHtml(url, delay = 3000) {  
  setTimeout(async () => {

    let req = got(url)

    setTimeout(() => {
      req.cancel()
    }, 60000)

    try {
      console.log(`Searching ${url}`.yellow)
      let res = await req;
      const { body } = res;
      console.log('downloaded:' + url)
      //console.log(body.slice(0, 25))
      return body
    } catch(err) {
      console.log(colors.red(err.message))
      if(req.isCanceled) {
        console.log('the reques is canseled and resend:'.red + url)
        return await getHtml(url)
      }
    }


  }, delay)
}

exports.getHtml = getHtml;

function getMultipleHtmlFiles(listOfUrl, delay) {
  const listOfHtml = []

  for(let idx = 0; idx < listOfUrl.length; idx++) {

    const htmlOnCourse = new Promise((res, rej) => {
      const time = idx * 1000 * delay;
      setTimeout( () => {

        getHtml(listOfUrl[idx])

        res(`url: ${listOfUrl[idx]}; delay: ${time}ms`)

      }, time)
    })
    
    listOfHtml.push(htmlOnCourse)
  }

  return listOfHtml
}

exports.getMultipleHtmlFiles = async function(listOfUrl) {

  console.log(listOfUrl)


  //ALERTA: Arreglar esta linea de codigo, no tiene nada entre corchetes
  const listOfPromises = listOfUrl.map( url => {} )
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