const { expect } = require('chai')
const MusicDownloader = require('index.js')

description() {
  it(`should download all album's songs if is passed and album info.`, async () => {
    const md = new MusicDownloader()

    const albumData = {
      name: 'manic',
      songs: [
        { 
          name: 'wipe your tears',
          artist: 'halsey'
        },
        {
          name: 'be kind',
          artist: ['halsey', 'marshmellow']
        }
      ]
    }

    const listOfSongsPath = await md.downloadAlbumSongs(albumData)
  })
}