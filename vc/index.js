const ffmpeg = require('fluent-ffmpeg')
const NodeID3 = require('node-id3')
const fse = require('fs-extra')

const fs = require('fs')
const readline = require('readline');

const path = require('path')

function writeMetaData(filePath, metadata) {
	return new Promise((res, rej) => {
		const tags = {
		  album: metadata.album ,
		  artist: metadata.artist,
		  performerInfo: metadata.artist,
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

function convertVideoToAudio2(videoPath, audioPath, metadata) {
	return new Promise((res, rej) => {
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

async function convertMultipleFiles(from, to) {
	const album = JSON.parse(fs.readFileSync('./input/data.json', 'utf-8'))

	console.log(album.title + ' by ' + album.artist )
	let folder = `${album.artist} - ${album.title} (${album.year})`
	await fse.ensureDir(path.join(__dirname, 'output', folder))

	for (let track = from; track <= to; track++) {
		let coverPath = path.join(__dirname, 'input', `${album.cover}`)

		let songFormatedTrack = (track < 10)? String('0' + track) : track

		let metadata = {
			track: songFormatedTrack,
			title: album.tracks[(track - 1)].title,
			album: album.title,
			artist: album.artist,
			year: album.year,
			genre: album.genre,
			cover: coverPath
		}

		let videoPath = path.join(__dirname, 'input', `${track}.mp4`)
		let audioPath = path.join(__dirname, 'output', folder, `${metadata.track}.${metadata.title}.mp3`)
		console.log(audioPath)

		await convertVideoToAudio2(videoPath, audioPath, metadata)
		await writeMetaData(audioPath, metadata)
	}
}

(async () => {
	convertMultipleFiles(1, 2)
})();