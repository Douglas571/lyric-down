const EventEmiter = require('events')
const path = require('path')
const ytdl = require('ytdl-core')

const readline = require('readline');
const fse = require('fs-extra')

const { convertToAudio } = require('./util')

class YoutubeMusicDownloader extends EventEmiter {
  constructor({ url, audioRate, metadata, audioPath }){
    super()

    this._url = url
    this._audioRate = audioRate
    this._metadata = metadata

    this._audioPath = audioPath
    this._videoPath = ''

    this._folder = path.dirname(this._audioPath)

    this._temp = path.join(__dirname, 'temp')
  }

  async ensureDir() {
    try {

      await fse.ensureDir(this._temp)
      await fse.ensureDir(this._folder)

      return true

    } catch (err) {
      console.log(err)
    }
  }

  downloadVideo(){
    return new Promise( (res, rej) => {
      this.emit('downloading', 100)


      this.ensureDir().then( () => {
        let videoStream = ytdl(this._url, {
          quality: 'highestaudio',
        })

        this._videoPath = path.join(this._temp, `${Date.now()}.mp4`)
        let videoOutputStream = fse.createWriteStream(this._videoPath)

        let starttime;
        videoStream.once('response', () => {
          this.emit('start', this._url)
          starttime = Date.now();
        });

        videoStream.on('progress', (chunkLength, downloaded, total) => {
          const percent = downloaded / total;

          const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
          const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
          process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
          process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`);
          process.stdout.write(`, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `);
          readline.moveCursor(process.stdout, 0, -1);
        });

        videoStream.on('end', () => {
          process.stdout.write('finished download');
          process.stdout.write('\n\n');

          res(this._videoPath)  
        });

        videoStream.pipe(videoOutputStream)
      })
    })   

  }

  async convertVideo(){
    this.emit('converting', 100)

    await util.convertToAudio(this._videoPath, this._audioPath, this._metadata)

    return this
  }

  async writeMetadata(){

    await util.writeMetadata(this._audioPath, this._metadata)
    return this
  }

  async run() {
    await this.downloadVideo()
    await this.convertVideo()
    await this.writeMetadata()

    this.emit('end', this._audioPath)
  }
}

module.exports = YoutubeMusicDownloader