const { lookup } = require('./spotify.js');
const { normalizeTracks, concurrentAsync } = require('./util.js');
const { searchYoutubeVideoNative } = require('./youtube.js');
const { downloadVideo } = require('./download.js');
const { metadata } = require('./tags.js');

const METHODS = {
  DOWNLOAD: 0,
  TAG: 1
};

const _METHODS = {
  /* Download method */
  0: function(dl) {
    return new Promise((resolve, reject) => {
      lookup(dl.spotifyToken, dl.spotifyURI).then((rawTracks) => {
        /* TODO Log tracks */
        let tracks = normalizeTracks(rawTracks);
        concurrentAsync(tracks, dl.threads, (track) => {
          searchYoutubeVideoNative(track.name).then((video) => {
            /* TODO Log download start */
            downloadvideo(video.id, track.path).then((res) => {
              /* TODO Log download finish */
              let data = res ? res : track.path;
              metadata(data, track).then((res) => {
                /* TODO Log TAG done */
                track.data = res;
                resolve(track);
              }).catch(reject);
            })
          })
        }, undefined).then(resolve).catch(reject);
      }).catch(reject);
    })
  }
  /* Tag method */
  1: function(downloader) {
    return new Promise((resolve,reject) => {

    })
  }
}

modules.exports = {
  METHODS: METHODS,
  _METHODS: _METHODS
};
