const { JSDOM } = require('jsdom')

function extractLyric(html, knownInfo = {}) {
  const page = JSDOM.fragment(html)

  let url = ''
  let track = ''
  let title = ''
  let artist = []
  let album = ''
  let lyric = ''

  if(knownInfo.url) {
    url = knownInfo.url

  } else {
    url = page.querySelector('link[rel="amphtml"]').getAttribute('href')
  }

  if(knownInfo.track) {
    track = knownInfo.track

  } else {
    //Implement a way to get the track from lyric
  }

  if(knownInfo.title) {
    title = knownInfo.title;

  } else {
    title = page.querySelector('h1.mxm-track-title__track').textContent
    title = title.replace('Letra', '')
  }

  if(knownInfo.artist) { 
    artist = knownInfo.artist;

  } else {
    let art = page.querySelector('a.mxm-track-title__artist').textContent
    artist.push(art)
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

    lyric += parts[0].textContent + '\n'
    lyric += parts[1].textContent
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

exports.extractLyric = extractLyric;