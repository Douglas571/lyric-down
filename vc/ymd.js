const EventEmiter = require('events')
const path = require('path')
const ytdl = require('ytdl-core')

const readline = require('readline');
const fse = require('fs-extra')

const util = require('./util')

class YoutubeMusicDownloader extends EventEmiter {
  constructor({ url, audioRate, metadata, audioPath }){
    super()

    this._url = url
    this._audioRate = audioRate
    this._metadata = metadata

    this._appData = path.join(process.env.APPDATA, 'ymd')
    this._temp = path.join(this._appData, 'temp', metadata.album)
    this._donwloadFolder = path.join(process.env.HOMEPATH, 'downloads')

    this._folder = path.join(this._donwloadFolder, path.dirname(audioPath))
    this._audioPath = path.join(this._donwloadFolder, audioPath)
    this._videoPath = path.join(this._temp, `${url.split('=')[1]}.mp4`)    
  }

  async ensureFolders() {
    try {

      await fse.ensureDir(this._appData)
      await fse.ensureDir(this._temp)
      await fse.ensureDir(this._folder)

      if(process.env.NODE_ENV == 'dev') {
        console.log('[FOLDER DEBUG]')
        console.log("  + appdata: ", this._appData)
        console.log("  + temp: ", this._temp)
        console.log("  + folder: ", this._folder)
        console.log("  + audio: ", this._audioPath)
        console.log("  + video: ", this._videoPath)  
        console.log()
      }
      
      return true

    } catch (err) {
      console.log(err)
    }
  }

  downloadVideo(){
    return new Promise( (res, rej) => {

      let videoStream = ytdl(this._url, {
        quality: "highestaudio"
      })

      let videoOutputStream = fse.createWriteStream(this._videoPath)

      let starttime;
      videoStream.once('response', () => {
        this.emit('start', this._url)
        starttime = Date.now();
      });

      videoStream.on('progress', (chunkLength, downloaded, total) => {
        let percent = downloaded / total;

        let downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
        let estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
        process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
        process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`);
        process.stdout.write(`, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `);
        readline.moveCursor(process.stdout, 0, -1);

        percent = percent * 100
        downloaded = ( downloaded / 1024 ) / 1024
        total = (total / 1024) / 1024

        this.emit('downloading', { percent, downloaded, total })
      });

      videoStream.on('end', () => {
        process.stdout.write('finished download');
        process.stdout.write('\n\n');

        res(this._videoPath)
      });

      videoStream.pipe(videoOutputStream)
    })   
  }

  async convertVideo(){
    this.emit('converting', 100)

    await util.convertToAudio(this._videoPath, 
      this._audioPath, this._metadata)

    return this
  }

  async writeMetadata(){

    await util.writeMetadata(this._audioPath, this._metadata)
    return this
  }

  async run() {
    await this.ensureFolders()

    await this.downloadVideo()
    await this.convertVideo()
    await this.writeMetadata()

    this.emit('end', this._audioPath)
  }
}

module.exports = YoutubeMusicDownloader