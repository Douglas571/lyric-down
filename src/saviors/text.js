const fse = require('fs-extra')
const os = require('os')

exports.saveAlbum = async function({ name, lyrics }, rootDir) {
  albumName = name.split('//').join(' ').trim()

  let listOfPath = 
    lyrics
      .map( lyric => { 
        const title = lyric.title.split('//').join(' ').trim()
       
        return {
          filename: `${rootDir}\\${albumName}\\${title}.txt`,
          text: formatData(lyric)
        }
      })
      .map(async ({ filename, text }) => {
        try {
          await fse.outputFile(filename, text)
          return filename

        } catch(err) {
          throw err

        }
      })

  listOfPath = await Promise.allSettled(listOfPath)

  return listOfPath.map((promise) => {
    let filename = promise.value
    return filename.replace(os.homedir() + '\\', '')
  })
}

/**
 * Format the lyric data for save in text files.
 * @param {Lyric} lyric - The lyric that will be formated.
 */
function formatData({ title, album, artist, lyric, url }){

  if(Array.isArray(artist)) {
    if(artist.length == 2) artist = artist.join(' & ')
    else if(artist.length > 2) {
      artist = artist.join(', ')

      const lastComma = artist.lastIndexOf(',')
      const partOne = artist.slice(0, lastComma)
      const partTwe = artist.slice(lastComma + 1)

      artist = [partOne, partTwe].join(' &')
    }
  }

  let textToSave = `"${title}" from "${album}" album\n`
     textToSave += `by ${artist}\n\n`
     textToSave += `${lyric}\n\n`
     textToSave += `extracted from: "${url}"`

  return textToSave
}