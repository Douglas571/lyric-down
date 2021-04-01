const got = require('got')
const { JSDOM } = require('jsdom')
const fs = require('fs')


      //const dom = new JSDOM(page)
      //const el = dom.window.document.getElementById('lyric-body-text')
      //console.log(JSON.stringify(el))

async function save(info, title, artist) {
  const p = Date.now()

  title = title.toLowerCase()
  artist = artist.toLowerCase()
  console.log(`lyrics\\${title}-${artist}.html`)

  fs.writeFile(`lyrics\\${title}-${artist}.html`, info, (err) => {
    if(err) {
      console.log(err.message)
    } else {
      console.log('saved :V')
    }
  })
}

async function read() {
  return new Promise((resolve) => {
    fs.readFile(`lyrics\\l.html`, 'utf-8', (err, text) => {
      if(err)  console.log(err.message);
      resolve(text);
    });
  })
}

async function getPage(url) {
  const res = await got(url);
  const { body } = res;
  return body
}

async function getLyric(url) {
  console.log('Searching lyric from "' + url + '"...')
  const page = await getPage(url)//await getLyric(url)

  const frag = JSDOM.fragment(page)

  const title  = frag.querySelector('#lyric-title-text').textContent
  const album  = frag.querySelector('div.falbum h3 a').textContent
  const artist = frag.querySelector('#lyric-title-text ~ h3.lyric-artist a').textContent
  const lyric  = frag.querySelector('#lyric-body-text').textContent

  let lyricToSave = '"' + title + '" from "' + album + '"\n' + ' by ' + artist + '\n\n' + lyric + '\n\n';
  lyricToSave += 'extracted from: ' + url;
  

  save(lyricToSave, title, artist)
}

class Application {
  constructor() {
    this.defaultDir = '/lyrics'
  }

  async getLyric(lyric) {

    if(Array.isArray(lyric)) {
      console.log('is a list')

    } else {
      console.log('is a song')
    }
  }

  async getLyricFromUrl(listOfUrl) {

    for(let url of listOfUrl) {
      getLyric(url)

    }
  }
}

exports.dir = 'jldjfjsdfjlsf';

module.exports = Application