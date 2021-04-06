//

/*

--- NOTAS ---

https://www.lyrics.com/lyric/33061922/Castle
https://www.lyrics.com/lyric/33061923/Halsey/Hold+Me+Down https://www.lyrics.com/lyric/33061924/Halsey/New+Americana https://www.lyrics.com/lyric/33061925/Halsey/Drive https://www.lyrics.com/lyric/33061927/Halsey/Colors

https://www.lyrics.com/album/3227442/Badlands
https://www.lyrics.com/album/3377676/Room-93%3A-The-Remixes-%5BLP%5D
https://www.lyrics.com/album/833363/Brass-Band-Spectacular-%5B3-discs%5D

npm i --save-dev mocha chai

*/

const { Command } = require('commander')

const { Table } = require('console-table-printer');
const prompt = require('prompt').start();
const colors = require('colors')

const Application = require('./src')

const app = new Application()
const commandLine = new Command()

prompt.message = colors.gray(`[${colors.green('?')}] `)
prompt.delimiter = '';

commandLine
  .version(require('./package.json').version)

  .option('-gl, --get-lyric <name...>', 'Get lyric of a song')
  .option('-glfu, --get-lyric-from-url <url...>', 'Get a lyric of a song by url')
  .option('-glfa, --get-lyrics-from-album <name>', 'Get a lyrics of from an album')
  .option('-glfau, --get-lyrics-from-album-url <name...>', 'Get a lyrics from an album url')
  .option('-ep, --epub', 'Save the lyrics in an epub file')

  .option('-s, --save-in <dir>', 'Specify a dir url', app.defaultDir)
  .parse();

(async () => {

  const option = commandLine.opts()

  if(option.getLyric) {
    await app.getLyric(option.getLyric)
  }

  if(option.getLyricFromUrl) {
    const listOfUrl = option.getLyricFromUrl

    for(let url of listOfUrl) {
      app.downloadLyricFromUrl(url)
    }
  }

  if(option.getLyricsFromAlbumUrl) {
    const listOfUrl = option.getLyricsFromAlbumUrl

    for(let url of listOfUrl) {

      let albumData = await app.getAlbumData(url)

      const tableOfUrl = new Table();
      for(url of albumData.listOfLyrics) {
        tableOfUrl.addRow({ idx: albumData.listOfLyrics.indexOf(url), url: url.slice(0, 30)})
      }

      tableOfUrl.printTable()

      albumData.listOfLyrics = await app.getAllLyrics(albumData.listOfLyrics)

      const result = await prompt.get([
        { name: 'name', 
          description: `Type a new name to change it`, 
          default: albumData.name}])

      albumData.name = result.name

      if(option.epub) {
        await app.saveAlbumOfLyrics(albumData, 'epub')
      }
    }
  }

})();
