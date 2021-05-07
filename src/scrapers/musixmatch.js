const colors = require('colors')
const { JSDOM } = require('jsdom')

exports.name = 'musixmatch'

exports.extractLyricData = function (html, knownInfo = { track: 0}) {
  console.log(colors.blue(html.slice(0, 25)))
  const page = JSDOM.fragment(html)

  let url = ''
  let track = 0
  let title = ''
  let artist = []
  let album = ''
  let lyric = ''

  if(knownInfo.url) {
    url = knownInfo.url

  } else {
    url = page.querySelector('meta[property="al:web:url"]').getAttribute('content')
  }

  if(knownInfo.track !== undefined) {
    track = knownInfo.track

  } else {
    //Implement a way to get the track from lyric
  }

  if(knownInfo.title) {
    title = knownInfo.title;

  } else {
    title = page.querySelector('h1.mxm-track-title__track').textContent
    title = title.replace('Letra', '')
     

    if(title.indexOf(' (fe') > -1) title = title.slice(0, title.indexOf(' (fe'))
  }

  if(knownInfo.artist) { 
    artist = knownInfo.artist;

  } else {
    let art = page.querySelectorAll('a.mxm-track-title__artist-link')
    for(let link of art) {
      artist.push(link.textContent)
    }
  }

  if(knownInfo.album) {
    album = knownInfo.album
  } else {
    album = page.querySelector('h2.mui-cell__title').textContent
  }

  console.log(colors.red(url))
  console.log('translate: '.green + url.includes('/traduccion/espanol'))
  if(url.includes('/traduccion/espanol')) {
    title = title.replace('y traducción', '').trim()

    console.log("#extractLyricData translate ---> title: " + title)
    console.log()

    lyric = extractLyricTranslate(html)
  
  } else {
    console.log('#extractLyricData without translate ---> ')

    let parts = page.querySelectorAll('p.mxm-lyrics__content')

    parts.forEach( part => {
      lyric += part.textContent + '\n'
    })

    lyric = lyric.slice(0, lyric.lastIndexOf('\n'))
  }

  const song = {
    url,
    track,
    title,
    artist,
    album,
    lyric
  }

//  console.log('the lyricSong is:')
  //console.log(song)

  return song
}

exports.extractAlbumData = function (html, knownInfo = {}) {
  const albumData = {}
  const page = JSDOM.fragment(html)

  if(knownInfo.name) {
    albumData.name = knownInfo.name

  } else {
    albumData.name = page.querySelector('div.mxm-album-banner__title h1').textContent
  }

  if(knownInfo.artist) {
    albumData.artist = knownInfo.artist
  } else {
    albumData.artist = page.querySelector('h2.mxm-album-banner__artist').textContent
  }

  if(knownInfo.url) {
    albumData.url = knownInfo.url
  } else {
    albumData.url = page.querySelector('meta[property="og:url"]').getAttribute('content')
  }

  albumData.lyricsToDownload = []

  let tracks = page.querySelectorAll('li[id*="track_"]')
  tracks.forEach( track => {
    let lyric = {}

    lyric.state = 1
    lyric.track = Number(track.querySelector('div.mui-cell__index-view').textContent)
    lyric.url = 'https://www.musixmatch.com' + track.querySelector('a').getAttribute('href')
    lyric.title = track.querySelector('h2.mui-cell__title').textContent

    albumData.lyricsToDownload.push(lyric)
  })

  return albumData
}

function extractLyricTranslate(html, knownInfo = {}) {
  const frag = JSDOM.fragment(html)

  let translateLyric = {
    en: [],
    es: []
  }

  const listNodes = frag.querySelectorAll('div.mxm-translatable-line-readonly')
  const lines = Array.from(listNodes)

  lines.forEach( line => {
    const node = line.querySelectorAll('div.col-xs-6')
    translateLyric
      .en
      .push(node[0].textContent)
    
    translateLyric
      .es
      .push(node[1].textContent)
  })

  translateLyric.en = translateLyric.en.map( line => line + '\n')
  translateLyric.es = translateLyric.es.map( line => line + '\n')

  return translateLyric
}

exports.extractLyricTranslate = extractLyricTranslate