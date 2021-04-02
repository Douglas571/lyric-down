const { expect } = require('chai')
const { stripIndents } = require('common-tags')
const Application = require('./index.js')

const path = require('path')

const app = new Application()

describe('Application main cases', async () => {
  
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

  it('Should return the text of the lyric pre-saved', async function() {

  })
})