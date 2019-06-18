const fetch = require('node-fetch');

const API_BASE = 'https://api.spotify.com/v1/';
const API_TRACK = function(id) {return { method: 'GET', url: `${API_BASE}tracks/${encodeURI(id)}` }};
const API_ALBUM = function(id) {return { method: 'GET', url: `${API_BASE}albums/${encodeURI(id)}`}};
const API_ALBUM_TRACKS = function(id) {return { method: 'GET', url: `${API_BASE}albums/${encodeURI(id)}/tracks` }};
const API_PLAYLIST = function(id) {return { method: 'GET', url: `${API_BASE}playlists/${encodeURI(id)}/tracks?limit=100&fields=items(track(name,track_number,disc_number,artists,album(name,images,total_tracks))),next` }};

function parseURI(spotifyURI) {
  let parts = spotifyURI.split(':');
  if (parts.length === 3) {
    if (parts[0] === 'spotify') {
      return {
        provider: parts[0],
        type: parts[1],
        id: parts[2]
      };
    }
  }
  return null;
}

function lookup(token,spotifyURI) {
  return new Promise((resolve,reject) => {
    let uri = parseURI(spotifyURI);
    if (uri === null) return reject(new Error(`Bad URI: ${spotifyURI}`));
      switch(uri.type) {
        case 'track':
        return reject(new Error('Not implemented'));
        break;
        case 'album':
        return lookupAlbum(API_ALBUM(uri.id),API_ALBUM_TRACKS(uri.id),token).then(resolve).catch(reject);
        break;
        case 'playlist':
        return lookupPlaylist(API_PLAYLIST(uri.id),token).then(resolve).catch(reject);
        break;
        default:
        return reject(new Error(`Unknow URI type: ${uri.type}`));
      }
  });
}

function lookupPlaylist(api,token) {
  return new Promise((resolve,reject) => {
    fetch(api.url,{ method: api.method, headers: { 'Authorization': `Bearer ${token}` } }).then((res) => {
      res.json().then((json) => {
        if (json.items === undefined) return reject(`Spotify response error ${JSON.stringify(json)}`);
        var tracks = [];
        for (let item of json.items) {
          let track = {
            track_name: item.track.name,
            track_number: item.track.track_number,
            disc_number: item.track.disc_number,
            album_name: item.track.album.name,
            album_tracks: item.track.album.total_tracks,
            album_image: item.track.album.images.length > 0 ? item.track.album.images[0].url : null
          },
          artists = [];
          for (let artist of item.track.artists) {
            artists.push(artist.name);
          }
          track.artist = artists.join(', ');
          tracks.push(track);
        }
        if (json.next !== null) {
          api.url = json.next;
          lookupPlaylist(api,token).then((nextTracks) => {
            var tracksFinal = tracks;
            for (let track of nextTracks) {
              tracksFinal.push(track);
            }
            resolve(tracksFinal);
          }).catch(reject);
        } else {
          resolve(tracks);
        }
      }).catch(reject);
    }).catch(reject);
  });
}

function lookupAlbum(apiInfo, apiTracks, token) {
  return new Promise((resolve,reject) => {
    fetch(apiInfo.url, { method: apiInfo.method, headers: { 'Authorization': `Bearer ${token}` } }).then((res) => {
      res.json().then((json) => {
        const albumName = json.name;
        const albumLength = json.total_tracks;
        const albumImage = json.images.length > 0 ? json.images[0].url : null
        fetch(apiTracks.url,{ method: apiTracks.method, headers: { 'Authorization': `Bearer ${token}` } }).then((res) => {
          res.json().then((json) => {
            if (json.items === undefined) return reject(`Spotify response error ${JSON.stringify(json)}`);
            var tracks = [];
            for (let item of json.items) {
              let track = {
                track_name: item.name,
                track_number: item.track_number,
                disc_number: item.disc_number,
                album_name: albumName,
                album_tracks: albumLength,
                album_image: albumImage
              },
              artists = [];
              for (let artist of item.artists) {
                artists.push(artist.name);
              }
              track.artist = artists.join(', ');
              tracks.push(track);
            }
            if (json.next !== null) {
              api.url = json.next;
              lookupPlaylist(api,token).then((nextTracks) => {
                var tracksFinal = tracks;
                for (let track of nextTracks) {
                  tracksFinal.push(track);
                }
                resolve(tracksFinal);
              }).catch(reject);
            } else {
              resolve(tracks);
            }
          }).catch(reject);
        }).catch(reject);
      }).catch(reject);
    }).catch(reject);
  });
}

module.exports = {
  parseURI: parseURI,
  lookup: lookup,
  lookupPlaylist: lookupPlaylist
}
