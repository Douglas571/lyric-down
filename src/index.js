const got = require('got')
const { stripIndents } = require('common-tags')
const { JSDOM } = require('jsdom')
const fs = require('fs')
const path = require('path')


      //const dom = new JSDOM(page)
      //const el = dom.window.document.getElementById('lyric-body-text')
      //console.log(JSON.stringify(el))

async function save(info) {
  const p = Date.now()

  fs.writeFile(`lyrics\\l.html`, info, (err) => {
    if(err) {
      console.log(err.message)
    } else {
      console.log('saved :V ' + `lyrics\\${title}-${artist}.html`)
    }
  })
}

async function read(name = 'l') {
  return new Promise((resolve) => {
    fs.readFile(`${name}.html`, 'utf-8', (err, text) => {
      if(err)  console.log(err.message);
      resolve(text);
    });
  })
}

async function getPage(url) {
  const res = await got(url);
  const { body } = res;
  console.log('downloaded:' + url)
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
  constructor(rootDir) {
    this.rootDir = rootDir || path.join(__dirname, '..', 'lyrics')
  }

  async getLyricFromUrl(url, mock) {
    //return await getLyric(url)
    console.log('Searching lyric from "' + url + '"...')

    let page;

    if(mock) {
      page = await read(path.join('test-files', mock))
    } else {
      page = await getPage(url)//await getLyric(url)
    }

    

    const frag = JSDOM.fragment(page)

    const title  = frag.querySelector('#lyric-title-text').textContent
    const album  = frag.querySelector('div.falbum h3 a').textContent

    let listOfArtist = frag.querySelectorAll('#lyric-title-text ~ h3.lyric-artist a')
    let artist = []

    listOfArtist.forEach( link => {
      artist.push(link.textContent)
    })

    artist = artist.slice(0, artist.length - 1)

    artist = (artist.length == 1) ? artist[0] : artist;

    const lyric  = frag.querySelector('#lyric-body-text').textContent

    const lyricData = {
      title,
      album,
      artist,
      lyric,
      url
    }

    console.log('page: "' + url + '" download')      

    return lyricData
  }

  async getLyricsFromAlbumUrl(url) {
    const listOfLyricsUrl = await this.getListOfLyricsUrl(url)
    console.log('Downloading "' + listOfLyricsUrl.length + '" lyrics')

    for(let url of listOfLyricsUrl) {
      this.downloadLyricFromUrl(url)
    }

  }

  async getListOfLyricsUrl(albumUrl) {
    console.log('searching album: "' + albumUrl + '"...')
    const html = await getPage(albumUrl)
    const page = JSDOM.fragment(html)

    const whereSlice = albumUrl.lastIndexOf('com/')
    const host = albumUrl.slice(0, whereSlice + 3)

    const links = page.querySelectorAll('tbody tr td div strong a')
    const listOfUrl = []

    links.forEach( link => {
      let url = host + link.getAttribute('href')
      listOfUrl.push(url)
    })

    //console.log(listOfUrl)

    return listOfUrl
  }

  formatData({ title, album, artist, lyric, url }) {

    if(Array.isArray(artist)) {
      if(artist.length == 2) artist = artist.join(' & ')
      else if(artist.length > 2) {
        artist = artist.join(', ')

        const lastComma = artist.lastIndexOf(',')
        const partOne = artist.slice(0, lastComma)
        const partTwe = artist.slice(lastComma + 1)

        artist = [partOne, partTwe].join(' &')
      }
    }

    let textToSave = `"${title}" from "${album}"\n`
       textToSave += `by ${artist}\n\n`
       textToSave += `${lyric}\n\n`
       textToSave += `extracted from: "${url}"`

    return textToSave
  }

  async saveLyric(lyricData, pathWhereSave = this.rootDir) {
    const textToSave = this.formatData(lyricData)
    let { title, artist } = lyricData

    if(Array.isArray(artist)) artist = artist[0]

    const fileName = `${title.toLowerCase()} - ${artist.toLowerCase()}.txt`

    pathWhereSave = path.join(pathWhereSave, fileName)

    return new Promise((res, rej) => {
      fs.writeFile(pathWhereSave, textToSave, (err) => {
        if(err) {
          console.log(err.message)
          rej(err)
        }
        
        res(pathWhereSave)
      })
    })
  }

  async readLyric(path) {
    return new Promise((res, rej) => {
      fs.readFile(path, 'utf-8', (err, text) => {
        if(err) {
          console.log(err.message)
          rej(err)
        }

        res(text)
      })
    })
  }

  async downloadLyricFromUrl(url, pathWhereSave) {
    const lyricData = await this.getLyricFromUrl(url)
    const pathFile = await this.saveLyric(lyricData)
    console.log(path.basename(pathFile) + "saved in: " + pathFile)
  }
}

exports.dir = 'jldjfjsdfjlsf';

module.exports = Application