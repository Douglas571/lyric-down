const { JSDOM } = require('jsdom')

exports.extractLyricData = async function (html, knownInfo = {}) {
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

  if(knownInfo.lyric) {
    lyric = knownInfo.lyric
  
  } else {
    let parts = page.querySelectorAll('p.mxm-lyrics__content')

    parts.forEach( part => {
      lyric += part.textContent + '\n'
    })

    lyric = lyric.slice(0, lyric.lastIndexOf('\n'))
  }

  return {
    url,
    track,
    title,
    artist,
    album,
    lyric
  }
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