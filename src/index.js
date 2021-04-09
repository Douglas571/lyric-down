const colors = require('colors')
const got = require('got')
const { stripIndents } = require('common-tags')
const { JSDOM } = require('jsdom')
const fs = require('fs')
const fse = require('fs-extra')
const Path = require('path')
const os = require('os')

const util = require('./util.js')
const logger = require('./logger.js').getInstance()
const lyricsScraper = require('./scrapers/lyrics.js')
const mxmScraper = require('./scrapers/musixmatch.js')

const makeEpub = require('./saviors/epub.js')
const textSavior = require('./saviors/text.js')

const EventEmiter = require('events')

//------------------ OUT OF INTERFACE --------------------//

/**
 * Create a new Aplication instance.
 * @class
 * @param {boolean} isTesting - Activate test mode
 */
class Application extends EventEmiter{
  constructor(isTesting) {
    super()

    this.STATES = {
      REMOVED: 0,
      TO_DOWNLOAD: 1
    };

    this.isTesting = isTesting;

    this.homedir = os.homedir()
    this.rootDir = Path.join(this.homedir, 'my-app', 'lyrics');

    fse.ensureDirSync(this.rootDir)

    if(this.isTesting) {
      fse.ensureDirSync(Path.join(this.rootDir, 'test'))
    }
  }

  getScraper(url) {
    let scraper
    if(url.startsWith('https://www.lyrics.com/')) {
      scraper = lyricsScraper

    } else if(url.startsWith('https://www.musixmatch.com/')) {
      scraper = mxmScraper

    } else {
      const err = new Error('Unknow host, can\'t extract info from there.')
      logger.error(err, { url })

      throw err
    }

    return scraper
  }
  
  async getLyric(url, knownInfo) {
    let scraper = this.getScraper(url)

    const html = await util.getHtml(url)
    const lyricData = await scraper.extractLyricData(html)

    return lyricData
  }

  async getAlbum(url, knownInfo) {
    const page = await util.getHtml(url)

    let scraper
    let host
    if(url.startsWith('https://www.lyrics.com/')) {
      scraper = lyricsScraper
      host = 'https://www.lyrics.com/'

    } else if(url.startsWith('https://www.musixmatch.com/')) {
      scraper = mxmScraper
      host = 'https://www.musixmatch.com/'

    } else {
      const err = new Error('Unknow host, can\'t extract info from there.')
      logger.error(err, { url })

      throw err
    }

    const albumData = await scraper.extractAlbumData(page)
    albumData.host = host
    return albumData
  }

  async getLyricsOfAlbum(albumData) {
    const listOfUrl = albumData.lyricsToDownload.map(({ url }) => url)
    const listOfHtmls = await util.getMultipleHtmlFiles(listOfUrl)
    
    const scraper = this.getScraper(albumData.host)
    
    let listOfLyrics = listOfHtmls
      .map(({ html, url }, idx) => 
        scraper
          .extractLyricData(html, { 
            track: (idx + 1),
            album: albumData.name,
            url
          })
      )
    
    listOfLyrics = await Promise.allSettled(listOfLyrics)
    listOfLyrics = listOfLyrics.map(({ value }) => value)

    return listOfLyrics

  }

//------------------- APP SAVIORS ----------------------//

  async saveLyric(lyric, format) {
  }

  /**
   * Ensure a folder with the name of the album
   * and save individual lyrics in text files.
   * @param {Album} albumData - The full data of the album
   * that will be save.
   * @param {Options} options - Options for saving the album.
   */
  async saveAlbum(albumData, { format }) {
    switch(format) {
      case 'text': 
        this._saveAlbumInTextFormat(albumData)
        break;

      case 'epub': 
        this._saveAlbumInEpubFormat(albumData)
        break;
        
      default:
        break;
    }    
  }

  async _saveAlbumInTextFormat(albumData) {
    textSavior.saveAlbum(albumData, this.rootDir)
  }

  async _saveAlbumInEpubFormat(albumData) {
    makeEpub(albumData, this.rootDir)
  }

//------------------- APP USER INTERFACE ----------------------//


  /** 
   * A function that choise how save the lyrics.
   * @param { Album } album - The album than whant to save.
   * @param { String } saveAs - The format in which want to save.
   */
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

  removeLyric(list, track) {
    list = JSON.parse(JSON.stringify(list));

    for(let lyric of list) {
      if(lyric.track === track) {
        lyric.state = this.STATES.REMOVED;
      }
    }

    const removed = list.filter( lyric => lyric.state == this.STATES.REMOVED)
                        .sort((a, b) => a.track - b.track );

    const toDownload = list.filter( lyric => lyric.state == this.STATES.TO_DOWNLOAD)
                        .sort((a, b) => a.track - b.track );

    return toDownload.concat(removed);
  }
}

module.exports = Application