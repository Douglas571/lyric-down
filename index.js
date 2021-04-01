//https://www.lyrics.com/lyric/33061922/Castle

/*

https://www.lyrics.com/lyric/33061923/Halsey/Hold+Me+Down https://www.lyrics.com/lyric/33061924/Halsey/New+Americana https://www.lyrics.com/lyric/33061925/Halsey/Drive https://www.lyrics.com/lyric/33061927/Halsey/Colors

*/

const { Command } = require('commander')
const Application = require('./src')

const app = new Application()
const commandLine = new Command()

commandLine
  .version(require('./package.json').version)

  .option('-gl, --get-lyric <name...>', 'Get lyric of a song')
  .option('-glfu, --get-lyric-from-url <url...>', 'Get a lyric of a song by url')
  .option('-glfa, --get-lyrics-from-album <name>', 'Get a lyrics of from an album')
  .option('-glfau, --get-lyrics-from-album-url <name>', 'Get a lyrics from an album url')

  .option('-s, --save-in <dir>', 'Specify a dir url', app.defaultDir)
  .parse();

(async () => {

  const option = commandLine.opts()

  if(option.getLyric) {
    await app.getLyric(option.getLyric)
  }

  if(option.getLyricFromUrl) {
    const url = option.getLyricFromUrl
    await app.getLyricFromUrl(url)
  }
})();