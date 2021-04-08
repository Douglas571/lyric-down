const { JSDOM } = require('jsdom')

exports.extractLyricData = function (html, knownData = {}) {
  const page = JSDOM.fragment(html)
  const lyricData = {}

  lyricData.title  = page.querySelector('#lyric-title-text').textContent
  lyricData.album  = page.querySelector('div.falbum h3 a').textContent
  lyricData.lyric  = page.querySelector('#lyric-body-text').textContent

  lyricData.artist = []
  page.querySelectorAll('h3.lyric-artist a[href*="artist/"')
      .forEach( artist => lyricData.artist.push(artist.textContent))

  lyricData.url = page.querySelector('meta[property="og:url"]').getAttribute('content')

  lyricData.track = (knownData.track)? knownData.track : 0;

  return lyricData
}

exports.extractAlbumData = function (html, knownData = {}) {
  const albumData = {}
  albumData.lyricsToDownload = []

  const page = JSDOM.fragment(html)

  albumData.url = page.querySelector('meta[property="og:url"]').getAttribute('content')
  albumData.name = page.querySelector('hgroup.hg1p23 h1 strong').textContent.replace(' Album', '')
  albumData.artist = page.querySelector('hgroup.hg1p23 h2').textContent

  
  const whereSlice = albumData.url.lastIndexOf('com/')
  const host = albumData.url.slice(0, whereSlice + 3)
  page
    .querySelectorAll('tbody tr')
    .forEach( tr => {
      const track = Number(tr.querySelector(':nth-child(1)').textContent);
      const title = tr.querySelector(':nth-child(2)').textContent;
      const url = host + tr.querySelector(':nth-child(2) div strong a').getAttribute('href');
      const state = 1;

      albumData.lyricsToDownload.push({ track, title, state, url })
    })

  return albumData
}