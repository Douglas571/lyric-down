const got = require('got')
const { stripIndents } = require('common-tags')
const { JSDOM } = require('jsdom')
const fs = require('fs')
const Path = require('path')
const os = require('os')
const colors = require('colors')

const makeEpub = require('./epub.js')

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

//------------------ OUT OF INTERFACE --------------------//

class Application {
  constructor(isTesting) {

    this.isTesting = isTesting;

    this.homedir = os.homedir()
    this.rootDir = Path.join(this.homedir, 'my-app', 'lyrics');

    if(!fs.existsSync(Path.join(this.rootDir))) {

      if(!fs.existsSync(Path.join(this.homedir, 'my-app')))
        fs.mkdirSync(Path.join(this.homedir, 'my-app'))

      if(!fs.existsSync(Path.join(this.rootDir)))
        fs.mkdirSync(this.rootDir)

      if(this.isTesting) {
        if(!fs.existsSync(Path.join(this.rootDir, 'test')))
          fs.mkdirSync(Path.join(this.rootDir, 'test'))
      }
    }
  }

  async getLyricFromUrl(url, mock) {
    console.log('Searching lyric from "' + url + '"...')

    let page;

    if(mock) {
      page = await read(Path.join('test-files', mock))
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

    if(this.isTesting) {
      pathWhereSave = Path.join(this.rootDir, 'test', fileName)
    } else {
      pathWhereSave = Path.join(this.rootDir, fileName)
    }

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

  async getAlbumData(albumUrl) {
    let name = '';
    let artist = '';
    let listOfLyrics = [];

    //download de page
    console.log('searching album: "' + albumUrl + '"...')
    const html = await getPage(albumUrl)
    const page = JSDOM.fragment(html)

    //parse name
    name = page.querySelector('hgroup.hg1p23 h1 strong').textContent
    //parse artist
    artist = page.querySelector('hgroup.hg1p23 h2').textContent

    //parse list of lyrics
    const links = page.querySelectorAll('tbody tr td div strong a')

    const whereSlice = albumUrl.lastIndexOf('com/')
    const host = albumUrl.slice(0, whereSlice + 3)
    links.forEach( link => {
      let url = host + link.getAttribute('href')
      listOfLyrics.push(url)
    })

    return {
      name,
      artist,
      listOfLyrics
    }
  }

//------------------- APP USER INTERFACE ----------------------//

  async downloadLyricFromUrl(url, pathWhereSave) {
    const lyricData = await this.getLyricFromUrl(url)
    const pathFile = await this.saveLyric(lyricData)
    console.log(Path.basename(pathFile) + "saved in: " + pathFile)
  }

  async downloadLyricsOfAlbum(url, saveAs, path) {
    //const ask = require('prompt').start()

    const albumData = await this.getAlbumData(url)
    albumData.listOfLyrics = albumData.listOfLyrics.map( url => this.getLyricFromUrl(url))
    albumData.listOfLyrics = await Promise.allSettled(albumData.listOfLyrics)
    
    //process.stdout.write('\x1Bc'); 
    albumData.listOfLyrics = albumData.listOfLyrics.map( result => result.value )

    /*
    albumData.listOfLyrics = await search(albumData.listOfLyrics)
    */

    switch(saveAs) {
      case 'text': 
        this.getLyricsFromAlbumUrl(url)
        break;

      case 'epub':
        await makeEpub(albumData, this.rootDir)
        break;

      default:

        break;
    }
  }


  async getAllLyrics(listOfUrl) {
    listOfUrl = listOfUrl.map( url => this.getLyricFromUrl(url))
    listOfUrl = await Promise.allSettled(listOfUrl)

    return listOfUrl.map( result => result.value )
  }

  async saveAlbumOfLyrics(albumData, saveAs) {
    switch(saveAs) {
      case 'text': 
        
        break;

      case 'epub':
        await makeEpub(albumData, this.rootDir)
        break;

      default:

        break;
    }
  }
}

module.exports = Application