const path = require('path')

const { expect } = require('chai')
const { stripIndents } = require('common-tags')

const util = require('./util.js')
const mms = require('./musixmatch-scraper');

describe.only('Musixmatch scraper use case', async () => {
  it('Should extract the lyric data from html file', async () => {

    const expectedData = {
      url: 'https://www.musixmatch.com/es/letras/Justin-Bieber/Ghost',
      track: 1,
      title: 'Ghost',
      artist: ['Justin Bieber'],
      album: 'Justice',
      lyric: stripIndents`Youngblood thinks there's always tomorrow
              I miss your touch some nights when I'm hollow
              I know you cross the bridge that I can't follow

              Since the love that you left is all that I get
              I want you to know that

              If I can't be close to you
              I'll settle for the ghost of you
              I miss you more than life (more than life)
              And if you can't be next to me
              Your memory is ecstasy
              I miss you more than life
              I miss you more than life

              Youngblood thinks there's always tomorrow
              I need more time, but time can't be borrowed
              I'd leave it all behind if I could follow

              Since the love that you left is all that I get
              I want you to know that

              If I can't be close to you
              I'll settle for the ghost of you
              I miss you more than life (yeah)
              And if you can't be next to me
              Your memory is ecstasy (oh)
              I miss you more than life
              I miss you more than life

              Oh-oh-oh, yeah
              More than life, oh

              So If I can't be close to you
              I'll settle for the ghost of you
              I miss you more than life
              And if you can't be next to me
              Your memory is ecstasy
              I miss you more than life
              I miss you more than life`,
    };

    const html = util.readPage(path.join(__dirname, '../test-files', 'mms-l1.html'))

    expect(html).to.be.a('string')

    const resivedData = mms.extractLyric(html, { 
      track: 1 , 
      url: 'https://www.musixmatch.com/es/letras/Justin-Bieber/Ghost'
    });


    expect(resivedData.url).to.be.equal(expectedData.url)
    expect(resivedData.track).to.be.equal(expectedData.track)
    expect(resivedData.title).to.be.equal(expectedData.title)
    expect(resivedData.artist).to.be.deep.equal(expectedData.artist)
    expect(resivedData.album).to.be.equal(expectedData.album)
    expect(resivedData.lyric).to.be.equal(expectedData.lyric)
  })
  
})