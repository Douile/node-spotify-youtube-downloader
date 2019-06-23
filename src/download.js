const fs = require('fs');
const { Writable } = require('stream');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

const URL_VIDEO = function(id) {return `https://youtube.com/watch?v=${encodeURIComponent(id)}`};

class BufferWritable extends Writable {
  constructor(options) {
    super(options);
    this.data = [];
    this.size = 0;
  }
  _write(chunk, enc, next) {
    this.data.push(chunk);
    this.size += chunk.length;
    next();
  }
  getBuffer() {
    return Buffer.concat(this.data);
  }
}

function download(videoId, outputPath) {
  if (outputPath === undefined || outputPath === null) {
    return downloadBuffer(videoId);
  } else {
    return downloadFile(videoId);
  }
}

function downloadBuffer(videoId) {
  return new Promise((resolve,reject) => {
    try {
      let url = URL_VIDEO(videoId);
      console.log(`Download start ${url}`);
      const stream = ytdl(url, { quality: 'highestaudio' });
      const outputStream = new BufferWritable({ estimatedSize: stream.readableHighWaterMark });
      var downloaded = 0, size;

      stream.on('info',(info,format) => {
        size = parseInt(format.clen);
      });
      stream.on('data',(chunk) => {
        downloaded += chunk.length;
        if (size) {
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(`${Math.floor((downloaded/size)*10000)/100}% downloaded`);
        }
      })
      stream.on('error', (e) => {
        console.log(`Download error ${e}`);
        reject(e);
      });
      stream.on('end', () => {
        process.stdout.write('\n');
        resolve(outputStream.getBuffer());
      });

      ffmpeg(stream)
        .audioBitrate(192)
        .audioCodec('libmp3lame')
        .format('mp3')
        .pipe(outputStream, { end: true });
    } catch(e) {
      reject(e);
    }
  })
}

function downloadFile(videoId, outputPath) {
  return new Promise((resolve,reject) => {
    try {
      let url = URL_VIDEO(videoId);
      console.log(`Download start ${url}`);
      const stream = ytdl(url, { quality: 'highestaudio' });

      stream.on('error', (e) => {
        console.log(`Download error ${e}`);
        reject(e);
      });
      stream.on('end', () => {
        resolve(outputPath);
      });

      ffmpeg(stream).audioBitrate(192).save(outputPath);
    } catch(e) {
      reject(e);
    }
  })
}

module.exports = {
  downloadVideo: download
}
