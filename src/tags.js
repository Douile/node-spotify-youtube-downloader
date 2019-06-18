const fs = require('fs');
const nodeid3 = require('node-id3');
const fetch = require('node-fetch');


function fetchAlbumArt(url) {
  return new Promise((resolve,reject) => {
    fetch(url).then((res) => {
      if (res.ok) {
        res.buffer().then(resolve).catch(reject);
      } else {
        reject(res.error());
      }
    }).catch(reject);
  })
}

function metadata(filePath, trackInfo) {
  return new Promise((resolve,reject) => {
    if (trackInfo.album_image !== null) {
      writeMetadataWithArt(filePath,trackInfo).then(resolve).catch((e) => {
        console.warn(e);
        writeMetadata(filePath,trackInfo).then(resolve).catch(reject);
      });
    } else {
      writeMetadata(filePath,trackInfo).then(resolve).catch(reject);
    }
  })
}

function writeMetadata(filePath, trackInfo, albumArt) {
  return new Promise((resolve,reject) => {
    let tags = {
      title: trackInfo.track_name,
      artist: trackInfo.artist,
      album: trackInfo.album_name,
      trackNumber: `${trackInfo.track_number}/${trackInfo.album_tracks}`,
      partOfSet: trackInfo.disc_number
    };

    if (albumArt !== undefined) {
      tags['image'] = {
        mime: 'jpeg',
        type: {
          id: 3,
          name: 'front cover'
        },
        description: 'album art',
        imageBuffer: albumArt
      }
    }

    nodeid3.update(tags, filePath, function(err,buffer) {
      if (err) reject(err);
      else resolve();
    })
  });
}

function writeMetadataWithArt(filePath, trackInfo) {
  return new Promise((resolve,reject) => {
    fetchAlbumArt(trackInfo.album_image).then((artworkData) => {
      writeMetadata(filePath, trackInfo, artworkData).then(resolve).catch(reject);
    }).catch(reject);
  });
}


module.exports = {
  metadata: metadata
}
