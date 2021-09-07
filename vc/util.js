const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const NodeID3 = require('node-id3')
const readline = require('readline')

function convertVideoToAudio2(videoPath, audioPath, metadata) {
	return new Promise((res, rej) => {
		console.log(videoPath)
		console.log(audioPath)
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
		const tags = {
		  album: metadata.album,
		  artist: metadata.artist[0],
		  performerInfo: metadata.artist.slice(1, s.length - 1).join(', '),
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

		NodeID3.write(tags, filePath, (err) => {
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