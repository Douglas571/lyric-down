require('dotenv').config();


    console.log(process.env)

const EventEmiter = require('events')
const path = require('path')

const YoutubeMusicDownloader = require('./ymd')

function makeAudioPath(metadata) {
  let { album, track, artist, title, year } = metadata

  let folder = `${album} (${year})`
  let filename = `${track}.${artist}-${title}.mp3`

  return path.join(folder, filename)
}

async function main() {
  let url = 'https://www.youtube.com/watch?v=KeoLuSSpGW0'
  let audioRate = 120
  let metadata = {
    album: 'Ashlyn',
    title: 'always',

    track: '00',
    totalTracks: '00',

    artist: ['Ashe'],
    genre: 'Pop',
    cover: undefined, //https://t2.genius.com/unsafe/522x0/https%3A%2F%2Fimages.genius.com%2Ffdb58c2930f130eff9e33f490d8b934c.1000x1000x1.png

    year: 2021
  }

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