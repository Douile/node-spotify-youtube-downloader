const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

const URL_VIDEO = function(id) {return `https://youtube.com/watch?v=${encodeURIComponent(id)}`};

function download(videId, outputPath) {
  if (outputPath === undefined) {
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
      const outputBuffer = Buffer.alloc(stream.readableLength);

      stream.on('error', (e) => {
        console.log(`Download error ${e}`);
        reject(e);
      });
      stream.on('end', () => {
        resolve(outputBuffer);
      });

      ffmpeg(stream).audioBitrate(192).output(outputBuffer);
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
