const path = require('path')

const { expect } = require('chai')
const { stripIndents } = require('common-tags')

const util = require('../util.js')
const l = require('./lyrics');

describe('Lyrics scraper use cases', async () => {
  it('Should extract the lyric data from html', async () => {
    const expectedData = 
    {
      track: 1,
      title: 'New Americana',
      album: 'Badlands',
      artist: ['Halsey', 'Merit Leighton', 'Mason Purece', 'Levi Gunn', 'Jayda Brown', 'Emma Gunn'],
      url: 'https://www.lyrics.com/lyric/33061924/New+Americana'   
    }

    const html = util.readPage(path.join(__dirname, 'test-files', 'l-la.html'))
    expect(html).to.be.a('string')

    const resivedData = l.extractLyricData(html, { 
      track: expectedData.track
    });

    expect(resivedData.title).to.be.equal(expectedData.title)
    expect(resivedData.album).to.be.equal(expectedData.album)
    expect(resivedData.artist).to.be.deep.equal(expectedData.artist)
    expect(resivedData.url).to.be.equal(expectedData.url)

    expect(resivedData.track).to.be.equal(expectedData.track)

    expect(resivedData.lyric).to.be.a('string')
  })

  it('Should extract the albumData from html', async () => {
    const expectedAlbum = {
      url: 'https://www.lyrics.com/album/3377676/Room-93%3A-The-Remixes-%5BLP%5D',
      name: 'Room 93: The Remixes [LP]',
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

    const html = util.readPage(path.join(__dirname, 'test-files', 'l-a1.html'))
    expect(html).to.be.a('string')

    const resivedAlbum = l.extractAlbumData(html);

    expect(resivedAlbum.url).to.be.equal(expectedAlbum.url)
    expect(resivedAlbum.name).to.be.equal(expectedAlbum.name)
    expect(resivedAlbum.artist).to.be.equal(expectedAlbum.artist)
    expect(resivedAlbum.lyricsToDownload).to.be.deep.equal(expectedAlbum.lyricsToDownload)

  })
})
