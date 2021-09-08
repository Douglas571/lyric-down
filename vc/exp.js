require('dotenv').config();

const path = require('path')
const fs = require('fs')

const YAML = require('yaml')

const YoutubeMusicDownloader = require('./ymd')

function makeAudioPath(metadata) {
  let { album, track, artist, title, year } = metadata

  let folder = `${album} (${year})`
  let filename = `${track}.${artist[0]}-${title}.mp3`

  return path.join(folder, filename)
}

async function main() {
  //album data
  let albumDataPath = path.join(__dirname, "album.yaml")
  let ad =  fs.readFileSync(albumDataPath, 'utf8')
  ad = YAML.parse(ad)
  let { tracks } = ad

  let num = 9

  let url = tracks[num].yt_url
  let audioRate = 120

  let metadata = {
    album: ad.name,
    title: tracks[num].title,

    track: ( num < 10?  '0' + num : num ) ,
    totalTracks: tracks.length,

    artist: tracks[num].artist || ad.artist,
    genre: ad.genre,
    cover: ad.cover,

    year: ad.year
  }

  console.log(url, metadata)

  let audioPath = makeAudioPath(metadata)

  let downloadOptions = {
    url, 
    audioRate, 
    metadata, 
    audioPath
  }

  new YoutubeMusicDownloader(downloadOptions)
    .on('start', (source) => {
      console.log('download start from: ', source)
    })
    .on('downloading', (state) => {
      //console.log('downloading: ', state.percent)
    })
    .on('converting', (progress) => {
      console.log('converting: ', progress)
    })
    .on('end', (audioPath) => {
      console.log('saved in: ' + audioPath )
    })
    .run()
}

(async () => { await main() })();