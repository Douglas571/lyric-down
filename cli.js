#!/usr/bin/env node

/*

--- NOTAS ---

https://www.lyrics.com/lyric/33061922/Castle
https://www.lyrics.com/lyric/33061923/Halsey/Hold+Me+Down https://www.lyrics.com/lyric/33061924/Halsey/New+Americana https://www.lyrics.com/lyric/33061925/Halsey/Drive https://www.lyrics.com/lyric/33061927/Halsey/Colors

https://www.lyrics.com/album/3227442/Badlands
https://www.lyrics.com/album/3377676/Room-93%3A-The-Remixes-%5BLP%5D
https://www.lyrics.com/album/833363/Brass-Band-Spectacular-%5B3-discs%5D

https://www.musixmatch.com/es/album/Halsey/Room-93-Commentary

npm i --save-dev mocha chai

*/
const os = require('os')
const path = require('path')
const { Command } = require('commander')
const Logger = require('./src/logger.js')
const Application = require('./src')

const app = new Application()
const logger = Logger.getInstance()
const commandLine = new Command()

commandLine
  .version(require('./package.json').version)
  .option('-s, --save-lyric <url...>', 'Get a lyric of a song by url.')
  .option('-sa, --save-album <url>', 'Get a lyrics of from an album.')
  .option('-f, --format <type>', 'Specify format to save.')
  .option('-t, --translate', 'Indicate if the lyric may be translate.')
  .parse();


process.on('uncaughtException', (err, org) => {
  console.error({ err, org })
  logger.error({ err, org })
});

(async () => {
  const option = commandLine.opts()

  if(option.saveLyric) {
    const listOfUrls = option.saveLyric
    const format = option.saveAs

    console.log(option)

    /*
    listOfUrls.forEach( url => {
      app.getLyric({ url, format })
    })
    */
  }

  /*

  if(option.saveAlbum) {
    const url = option.saveAlbum
    const format = option.format
    const translate = option.translate

    const albumData = await app.getAlbum(url)
    logger.info('the album to download is:', { album: albumData})

    albumData.lyrics = await app.getLyricsOfAlbum(albumData, { translate })
    logger.info('the album saved is', { album: albumData })

    const paths = await app.saveAlbum(albumData, { format })
    
    console.log('saved files')
    console.log(paths)
  }
  */
})();
