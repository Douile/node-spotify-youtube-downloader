const path = require('path');
const fs = require('fs');
const { lookup } = require('./spotify.js');
const { searchYoutubeVideoNative } = require('./youtube.js');
const { downloadVideo } = require('./download.js');
const { metadata } = require('./tags.js');
const { escapeFileName, concurrentAsync, normalizeTracks } = require('./util.js');
const { Downloader, METHODS } = require('./Downloader.js');

function logTracks(tracks) {
  let text = 'Tracks:';
  for (let i=0;i<tracks.length;i++) {
    text += `\n  ${i+1}. ${tracks[i].artist} - ${tracks[i].track_name}`;
  }
  return console.log(text);
}

function logVideo(path,video) {
  return console.log(`Got video [${video.id}] ${video.title} - "${path}" `);
}

function download({ spotifyToken, spotifyURI, downloadPath, range}) {
  return new Promise((resolve,reject) => {
    lookup(spotifyToken, spotifyURI).then((tracks) => {
      if (range !== undefined) tracks = reduceTracks(range);
      tracks = normalizeTracks(tracks,downloadPath);
      logTracks(tracks);
      concurrentAsync(tracks,5,asyncDownloadTrack(downloadPath),console.log).then(resolve).catch(reject);
    }).catch(reject);
  });
}

function resetTags({ spotifyToken, spotifyURI, downloadPath, range }) {
  return new Promise((resolve,reject) => {
    console.log('Tagging your tracks...');
    lookup(spotifyToken, spotifyURI).then((tracks) => {
      if (range !== undefined) tracks = reduceTracks(range);
      tracks = normalizeTracks(tracks,downloadPath);
      logTracks(tracks);
      concurrentAsync(tracks,5,promiseTagTrack,console.log).then(resolve).catch(reject);
    }).catch(reject);
  })
}

function asyncDownloadTrack(downloadPath) {
  const dpath = downloadPath;
  return async function(track) {
    let res;
    try {
      res = await downloadTrack(track,dpath);
    } catch(e) {
      console.log(`Error downloading ${track.name} ${e}`);
    }
    track.data = res;
    return track;
  }
}

function downloadTrack(track,downloadPath) {
  return new Promise((resolve,reject) => {
    searchYoutubeVideoNative(track.name).then((video) => {
      logVideo(track.path,video);
      downloadVideo(video.id, track.path).then((res) => {
        console.log(`Downloaded ${video.title}`);
        let data = res ? res : track.path;
        metadata(data, track).then(resolve).catch(reject);
      }).catch(reject);
    }).catch(reject);
  });
}

async function asyncTagTrack(track) {
  try {
    let res = await metadata(track.path,track);
    console.log(`Tagged ${track.name} ${track.track_number} ${track.album_tracks}`);
  } catch(e) {
    console.warn(`Error tagging ${track.name} ${e}`);
  }
  return track;
}

function promiseTagTrack(track) {
  return new Promise((resolve,reject) => {
    metadata(track.path,track).then((data) => {
      console.log(`Tagged ${track.name} ${track.track_number} ${track.album_tracks}`);
      resolve(track);
    }).catch((error) => {
      console.warn(`Error tagging ${track.name} ${error}`);
      reject(error);
    })
  })
}

function reduceTracks(tracks,range) {
  let reducedTracks = [];
  for (let i=0;i<tracks.length;i++) {
    if (i+1>=range[0]&&i+1<=range[1]) reducedTracks.push(tracks[i]);
  }
  return reducedTracks;
}


module.exports = {
  downloadTracks: download,
  tagTracks: resetTags,
  Downloader: Downloader,
  METHODS: METHODS
}
