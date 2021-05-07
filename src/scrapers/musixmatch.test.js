const path = require('path')

const { expect } = require('chai')
const { stripIndents } = require('common-tags')

const util = require('../util.js')
const mms = require('./musixmatch.js');

describe.skip('Musixmatch scraper use case', async () => {
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

    const html = util.readPage(path.join(__dirname, 'test-files', 'mms-l1.html'))

    expect(html).to.be.a('string')

    const resivedData = await mms.extractLyricData(html, { 
      track: 1
    });

    expect(resivedData.url).to.be.equal(expectedData.url)
    expect(resivedData.track).to.be.equal(expectedData.track)
    expect(resivedData.title).to.be.equal(expectedData.title)
    expect(resivedData.artist).to.be.deep.equal(expectedData.artist)
    expect(resivedData.album).to.be.equal(expectedData.album)
    expect(resivedData.lyric).to.be.equal(expectedData.lyric)
  })
  
  it('Should extract multiple artist', async () => {
    const expectedData = {
      artist: ['Taylor Swift', 'Bon Iver'],

      url: 'https://www.musixmatch.com/es/letras/Taylor-Swift-Bon-Iver/exile-Bon-Iver',
      title: 'exile',
      album: 'folklore',
      lyric: stripIndents`I can see you standing, honey
                          With his arms around your body
                          Laughin', but the joke's not funny at all
                          And it took you five whole minutes
                          To pack us up and leave me with it
                          Holdin' all this love out here in the hall

                          I think I've seen this film before
                          And I didn't like the ending
                          You're not my homeland anymore
                          So what am I defending now?
                          You were my town
                          Now I'm in exile, seein' you out
                          I think I've seen this film before

                          I can see you starin', honey
                          Like he's just your understudy
                          Like you'd get your knuckles bloody for me
                          Second, third, and hundredth chances
                          Balancin' on breaking branches
                          Those eyes add insult to injury

                          I think I've seen this film before
                          And I didn't like the ending
                          I'm not your problem anymore
                          So who am I offending now?
                          You were my crown
                          Now I'm in exile, seein' you out
                          I think I've seen this film before
                          So I'm leavin' out the side door

                          So step right out, there is no amount
                          Of crying I can do for you
                          All this time
                          We always walked a very thin line
                          You didn't even hear me out (You didn't even hear me out)
                          You never gave a warning sign (I gave so many signs)

                          All this time
                          I never learned to read your mind (Never learned to read my mind)
                          I couldn't turn things around (You never turned things around)
                          'Cause you never gave a warning sign (I gave so many signs)
                          So many signs, so many signs
                          You didn't even see the signs

                          I think I've seen this film before
                          And I didn't like the ending
                          You're not my homeland anymore
                          So what am I defending now?
                          You were my town
                          Now I'm in exile, seein' you out
                          I think I've seen this film before
                          So I'm leavin' out the side door

                          So step right out, there is no amount
                          Of crying I can do for you
                          All this time
                          We always walked a very thin line
                          You didn't even hear me out (Didn't even hear me out)
                          You never gave a warning sign (I gave so many signs)

                          All this time
                          I never learned to read your mind (Never learned to read my mind)
                          I couldn't turn things around (You never turned things around)
                          'Cause you never gave a warning sign (I gave so many signs)

                          All this time (So many signs)
                          I never learned to read your mind (So many signs)
                          I couldn't turn things around (I couldn't turn things around)
                          'Cause you never gave a warning sign (You never gave a warning sign)
                          You never gave a warning sign
                          Ah, ah`

    }

    const html = util.readPage(path.join(__dirname, 'test-files', 'mms-l2.html'))
    let resivedData = await mms.extractLyricData(html)

    //Most important test
    expect(resivedData.artist).to.be.deep.equal(expectedData.artist)

    //Checks for the other data...
    expect(resivedData.url).to.be.equal(expectedData.url)
    expect(resivedData.track).to.be.equal(0)
    expect(resivedData.title).to.be.equal(expectedData.title)
    expect(resivedData.album).to.be.equal(expectedData.album)
    expect(resivedData.lyric).to.be.equal(expectedData.lyric)
  })
  
  it('Should return the exact lyric passed to the "knownInfo" param', async () => {
    const expectedData = {
      url: 'https://www.musixmatch.com/es/letras/Taylor-Swift-Bon-Iver/exile-Bon-Iver',
      track: 2,
      title: 'exile',
      artist: ['Taylor Swift', 'Bon Iver'],
      album: 'folklore',
      lyric: 'some lyric...'
    }

    const resivedData = await mms.extractLyricData('', expectedData)

    expect(resivedData).to.be.deep.equal(expectedData)
  })

  it('Should extract the album data from html', async () => {
    const expectedData = {
      name: 'folklore',
      artist: 'Taylor Swift',
      url: 'https://www.musixmatch.com/es/album/Taylor-Swift/folklore',
      lyricsToDownload: [
        { 
          track: 1,
          title: 'the 1',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/the-1',
          state: 1
        },
        { 
          track: 2,
          title: 'cardigan',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/cardigan',
          state: 1
        },
        { 
          track: 3,
          title: 'the last great american dynasty',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/the-last-great-american-dynasty',
          state: 1
        },
        { 
          track: 4,
          title: 'exile (feat. Bon Iver)',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift-Bon-Iver/exile-Bon-Iver',
          state: 1
        },
        { 
          track: 5,
          title: 'my tears ricochet',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/my-tears-ricochet',
          state: 1
        },
        { 
          track: 6,
          title: 'mirrorball',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/mirrorball',
          state: 1
        },
        { 
          track: 7,
          title: 'seven',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/seven',
          state: 1
        },
        { 
          track: 8,
          title: 'august',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/august',
          state: 1
        },
        { 
          track: 9,
          title: 'this is me trying',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/this-is-me-trying',
          state: 1
        },
        { 
          track: 10,
          title: 'illicit affairs',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/illicit-affairs',
          state: 1
        },
        { 
          track: 11,
          title: 'invisible string',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/invisible-string',
          state: 1
        },
        { 
          track: 12,
          title: 'mad woman',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/mad-woman',
          state: 1
        },
        { 
          track: 13,
          title: 'epiphany',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/epiphany',
          state: 1
        },
        { 
          track: 14,
          title: 'betty',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/betty',
          state: 1
        },
        { 
          track: 15,
          title: 'betty',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/betty-1',
          state: 1
        },
        { 
          track: 16,
          title: 'peace',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/peace',
          state: 1
        },
        { 
          track: 17,
          title: 'hoax',
          url: 'https://www.musixmatch.com/es/letras/Taylor-Swift/hoax',
          state: 1
        }
      ]
    }

    const html = util.readPage(path.join(__dirname, 'test-files', 'mms-a2.html'))

    const resivedData = mms.extractAlbumData(html)

    expect(resivedData.name).to.be.equal(expectedData.name)
    expect(resivedData.artist).to.be.equal(expectedData.artist)
    expect(resivedData.url).to.be.equal(expectedData.url)

    expect(resivedData.lyricsToDownload).to.be.deep.equal(expectedData.lyricsToDownload)
  })

  it('Should extract the lyric with it\'s translate', async () => {

    let expectedData = {
        en: 
        [
          "Cheers to the wish you were here, but you're not\n",
          "Of everything we've been through\n",
          "Toast to the ones here today\n"
        ],
        es: 
        [
          "Brindemos por el deseo de que estuvieras aquí, pero no estás\n",
          "Por todo lo que hemos pasado\n",
          "Brindemos por los que hoy están aquí\n"
        ]
      }
    

    const file = path.join(__dirname, 'test-files', 'mms-lt1A.html')
    const html = await util.readPage(file)
    let resived = mms.extractLyricTranslate(html)

    expect(resived)
          .to.be.an('object')
          .that.includes.keys([ 'en', 'es'])


    expect(resived.en)
      .to.include.members(expectedData.en)

    expect(resived.es)
      .to.include.members(expectedData.es)  

  })
})

describe.skip('Mysixmatch scraper use case "On-Line"', async () => {

})

//TO-DOs

/*

  - add a funtion to get a translate lyric
*/