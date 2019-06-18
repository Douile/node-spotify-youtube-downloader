const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

const URL_VIDEO = function(id) {return `https://youtube.com/watch?v=${encodeURIComponent(id)}`};

function download(videoId, outputPath) {
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
        resolve();
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
