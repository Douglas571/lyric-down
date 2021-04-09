exports.saveAlbum = function(albumData, rootDir) {
  const albumName = album.name.split('//').join(' ').trim()
  const textToSave = albumData
                      .lyrics
                      .map( lyric => { 
                        const lyricTitle = lyric.title.split('//').join(' ').trim()
                        const lyricArtist = lyric.artist.split('//').join(' ').trim()

                        return {
                          filename: `${rootDir}\\${albumName}\\${lyricTitle} - ${lyricArtist}.txt`,
                          text: formatData(lyric)
                        }
                      })

  textToSave
    .forEach(({ filename, text }) => fse.outputFile(filename, text))
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

  let textToSave = `"${title}" from "${album}"\n`
     textToSave += `by ${artist}\n\n`
     textToSave += `${lyric}\n\n`
     textToSave += `extracted from: "${url}"`

  return textToSave
}