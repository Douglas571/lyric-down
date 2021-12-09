const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const NodeID3 = require('node-id3')
const readline = require('readline')

function convertVideoToAudio2(videoPath, audioPath, metadata) {
	return new Promise((res, rej) => {
		if(process.env.NODE_ENV == "dev") {
			console.log('[CONVERT VIDEO TO AUDIO - DEBUG]')
			console.log('  ', videoPath)
			console.log('  ', audioPath)
		}

		const videoStream = fs.createReadStream(videoPath)


		ffmpeg(videoStream)
			.audioBitrate(128)
			//.audioChannels(2)

			//.outputOptions(`-metadata `, `title=${metadata.title}`)

			.on('progress', p => {
				readline.cursorTo(process.stdout, 0);
				//process.stdout.write(prgs.currentKbps + " from " + prgs.targetSize)
				process.stdout.write(`${p.targetSize}kb processed from ${audioPath.split('\\')[7]}`);
				
			})
			.on('end', () => {
				console.log(`Convertion ready: ${audioPath}`)
				res()
			})
			.save(audioPath)
	})
}

function writeMetadata(audioPath, metadata) {
	return new Promise((res, rej) => {

		let mainArtist
		let performerArtist

		if(typeof metadata.artist == 'string') {
			mainArtist = metadata.artist

		} else {
			mainArtist = metadata.artist.join(', ')
			performerArtist = metadata.artist.slice(1, metadata.artist.length - 1).join(', ')

		}

		const tags = {
		  album: metadata.album,
		  artist: mainArtist,
		  performerInfo: performerArtist,
		  comment:
		  {
		  	language:"eng"
		  },
		  genre: metadata.genre,
		  title: metadata.title,
		  trackNumber: metadata.track,
		  year: metadata.year,
		  APIC: metadata.cover,
		}

		NodeID3.write(tags, audioPath, (err) => {
			if(err) throw new Error(err)
			else {
				res()
			}
		})	
	})
}

module.exports = {
	convertToAudio: convertVideoToAudio2,
	writeMetadata
}