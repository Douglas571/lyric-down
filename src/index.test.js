const { expect } = require('chai')
const { stripIndents } = require('common-tags')
const Application = require('./index.js')

const util = require('./util.js')
const mxm = require('./scrapers/musixmatch.js')
const fse = require('fs-extra')

const path = require('path')

const makeEpub = require('./saviors/epub.js')
const os = require('os')

const app = new Application(true)
describe.skip('Application main cases', async () => {
  //await app.start()

  
  it('should return the lyric data from an url', async  function() {
    //this.skip()
    const expectedData = 
    {
      title: 'Castle',
      album: 'Badlands',
      artist: 'Halsey',
      url: 'https://www.lyrics.com/lyric/33061922/Castle'
    }

    const result = await app.getLyricFromUrl(expectedData.url, 'b')

    expect(result.title).to.be.deep.equal(expectedData.title)
    expect(result.album).to.be.deep.equal(expectedData.album)
    expect(result.artist).to.be.deep.equal(expectedData.artist)
    //expect(result.lyric).to.be.deep.equal(expectedData.lyric)
    expect(result.url).to.be.deep.equal(expectedData.url)
  })

  it('should return the lyric data from a url when there multiple artist', async function() {
    //this.skip();
    const expectedData = 
    {
      title: 'New Americana',
      album: 'Badlands',
      artist: ['Halsey', 'Merit Leighton', 'Mason Purece', 'Levi Gunn', 'Jayda Brown', 'Emma Gunn'],
      url: 'https://www.lyrics.com/lyric/33061924/New+Americana'   
    }
    const result = await app.getLyricFromUrl(expectedData.url, 'a')

    expect(result.title).to.be.deep.equal(expectedData.title)
    expect(result.album).to.be.deep.equal(expectedData.album)
    expect(result.artist).to.be.deep.equal(expectedData.artist)
    //expect(result.lyric).to.be.deep.equal(expectedData.lyric)
    expect(result.url).to.be.deep.equal(expectedData.url)

  })
  
  it('Should return the desired string formated from lyric data', async function() {
    //this.skip()
    const lyricData = {
      title: 'Castle',
      album: 'Badlands',
      artist: ['Halsey', 'Alanis', 'Lauren J.'],
      lyric: 'Some Lyric...',
      url: 'https://www.lyrics.com/lyric/33061922/Castle'
    }
   
    const expectedText = 
      stripIndents`"Castle" from "Badlands"
                  by Halsey, Alanis & Lauren J.

                  Some Lyric...

                  extracted from: "https://www.lyrics.com/lyric/33061922/Castle"`;

    const resultText = app.formatData(lyricData)

    expect(resultText).to.be.equal(expectedText)
  })

  it('Should return the path where is saved the lyric data', async function() {
    const lyricData = {
      title: 'Castle',
      album: 'Badlands',
      artist: ['Halsey', 'Lauren J.'],
      lyric: 'Some Lyric...',
      url: 'https://www.lyrics.com/lyric/33061922/Castle'
    }

    /*
    const expectedText = 
      stripIndents`"Castle" from "Badlands"
                  by Halsey

                  SomeLyric...

                  extracted from: "https://www.lyrics.com/lyric/33061922/Castle"`;
    */

    let expectedText = '"Castle" from "Badlands"\n'
       expectedText += 'by Halsey & Lauren J.\n'
       expectedText += '\n'
       expectedText += 'Some Lyric...\n'
       expectedText += '\n'
       expectedText += 'extracted from: "https://www.lyrics.com/lyric/33061922/Castle"'


    const resultPath = await app.saveLyric(lyricData)
    const resultText = await app.readLyric(resultPath)

    expect(resultPath).to.be.a('string')
    expect(resultPath).to.not.includes(lyricData.artist[1])
    expect(resultText).to.be.equal(expectedText)
  })

  it('Should return a new list of lyrics updated', async function() {
    //this.skip()
    let resivedList = [
      { track: 1, title: 'Now or Never', url: 'some-url', state: 1},
      { track: 2, title: 'Manic',        url: 'some-url', state: 1},
      { track: 3, title: 'Gasoline',     url: 'some-url', state: 1},
      { track: 4, title: 'Drive',        url: 'some-url', state: 1},
      { track: 5, title: 'Coming Down',  url: 'some-url', state: 1}
    ];

    const expectedList = [
      { track: 2, title: 'Manic',        url: 'some-url', state: 1},
      { track: 4, title: 'Drive',        url: 'some-url', state: 1},
      { track: 1, title: 'Now or Never', url: 'some-url', state: 0},
      { track: 3, title: 'Gasoline',     url: 'some-url', state: 0},
      { track: 5, title: 'Coming Down',  url: 'some-url', state: 0}
    ];

    resivedList = app.removeLyric(resivedList, 1)
    resivedList = app.removeLyric(resivedList, 3)
    resivedList = app.removeLyric(resivedList, 5)

    expect(resivedList).to.be.deep.equal(expectedList)
  })
})


const Epub = require('epub-gen');
describe.only('App use case', async () => {
  it('Should return the album and lyrics data from "musixmatch"', async () => {
    const expectedData = {
      url: 'https://www.musixmatch.com/es/album/Conan-Gray/Checkmate',
      name: 'Kid Krow',
      artist: 'Conan Gray',
      lyricsToDownload: [
        { state: 1, track: 1, title: 'Checkmate', url: 'https://www.musixmatch.com/es/letras/Conan-Gray/Checkmate' },
        { state: 1, track: 4, title: 'Maniac', url: 'https://www.musixmatch.com/es/letras/Conan-Gray/Maniac' },
        { state: 1, track: 10, title: '(Can We Be Friends?)', url: 'https://www.musixmatch.com/es/letras/Conan-Gray/Can-We-Be-Friends'}
      ]
    }

    console.log('searching album...')
    const html = await util.getHtml('https://www.musixmatch.com/es/album/Conan-Gray/Checkmate')

    console.log('extracting album data...')
    const resivedData = mxm.extractAlbumData(html)

    expect(resivedData.name).to.be.equal(expectedData.name)
    expect(resivedData.url).to.be.equal(expectedData.url)
    expect(resivedData.aritst).to.be.equal(expectedData.aritst)

    expect(resivedData.lyricsToDownload[0]).to.be.deep.equal(expectedData.lyricsToDownload[0])
    expect(resivedData.lyricsToDownload[3]).to.be.deep.equal(expectedData.lyricsToDownload[1])
    expect(resivedData.lyricsToDownload[9]).to.be.deep.equal(expectedData.lyricsToDownload[2])
    
    const listOfUrl = resivedData.lyricsToDownload.map(({ url }) => url)
    const listOfHtmls = await util.getMultipleHtmlFiles(listOfUrl)
    const proLyrics = listOfHtmls.map(async ({ html, url }, idx) => mxm.extractLyricData(html, { track: (idx + 1), url, album: resivedData.name}))
    const result = await Promise.allSettled(proLyrics)
    resivedData.lyrics = result.map(({ value }) => value)


    fse.outputFile(`${resivedData.name} - ${resivedData.artist}.json`, JSON.stringify(resivedData), err => {
      if(err) console.log(err.message)
      else {
        console.log('success!!!')
      }

      const epubData = {
        title: resivedData.name,
        author: resivedData.artist,
        tocTitle: 'List of Songs from ' + resivedData.name + ' album:',
        content: [],
      }

      for(let lyric of resivedData.lyrics) {
        epubData.content.push({ title: lyric.title, data: `by ${lyric.artist}\n\n${lyric.lyric}`})
      }

      new Epub(epubData, path.join(os.homedir(), 'my-app', `${resivedData.name} - ${resivedData.artist}.epub`))
    })    
  })
})
