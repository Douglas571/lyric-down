const { expect } = require('chai')
const { stripIndents } = require('common-tags')
const Application = require('./index.js')

const path = require('path')

const app = new Application(true)
describe('Application main cases', async () => {
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

describe('App use case', async () => {
  it('Download an Album of lyrics and save epub', async () => {
    
    const expectedAlbum = {
      url: 'https://www.lyrics.com/album/3377676/Room-93%3A-The-Remixes-%5BLP%5D',
      name: 'Room 93: The Remixes [LP] Album',
      artist: 'Halsey',
      lyricsToDownload: [
        { track: 1, 
          title: 'Is There Somewhere', 
          url: 'https://www.lyrics.com/lyric/33123631/Is+There+Somewhere', 
          state: 1 
        },
        { track: 2, 
          title: 'Ghost', 
          url: 'https://www.lyrics.com/lyric/33123630/Ghost', 
          state: 1 
        },
        { track: 3, 
          title: 'Hurricane', 
          url: 'https://www.lyrics.com/lyric/33123629/Hurricane', 
          state: 1 
        },
        { track: 4, 
          title: 'Empty Gold', 
          url: 'https://www.lyrics.com/lyric/33123628/Empty+Gold', 
          state: 1 
        },
        { track: 5, 
          title: 'Trouble', 
          url: 'https://www.lyrics.com/lyric/33123627/Trouble', 
          state: 1
        }],
    }

    let resivedAlbum = await app.getAlbumData(expectedAlbum.url, 'album')
    console.log(resivedAlbum.lyricsToDownload)
    //resivedAlbum = await app.getLyricsOfAlbum(resivedAlbum)

    expect(resivedAlbum.name).to.be.equal(expectedAlbum.name)
    expect(resivedAlbum.artist).to.be.equal(expectedAlbum.artist)
    expect(resivedAlbum.lyricsToDownload).to.be.equal(expectedAlbum.lyricsToDownload)

    //expect(resivedAlbum.lyrics).to.be.deep.equal(expectedAlbum.lyrics)

    const expectedListOfLyrics = 
    [
      { track: 1, 
          title: 'Is There Somewhere', 
          url: 'https://www.lyrics.com/lyric/33123631/Is+There+Somewhere'
        },
        { track: 2, 
          title: 'Ghost', 
          url: 'https://www.lyrics.com/lyric/33123630/Ghost' 
        },
        { track: 3, 
          title: 'Hurricane', 
          url: 'https://www.lyrics.com/lyric/33123629/Hurricane'
        },
        { track: 4, 
          title: 'Empty Gold', 
          url: 'https://www.lyrics.com/lyric/33123628/Empty+Gold'
        },
        { track: 5, 
          title: 'Trouble', 
          url: 'https://www.lyrics.com/lyric/33123627/Trouble'
        }
    ];
  })
})
