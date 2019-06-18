# node-spotify-youtube-downloader
Download playlists or albums from spotify via [youtube](https://github.com/fent/node-ytdl-core), then automatically add id3 tags using data from spotify web API.

## About
CLI not yet ready

A spotify web API token is needed, you can generate one in the [Web API Console](https://developer.spotify.com/console/get-playlist-tracks/)

[Apache 2.0 license](LICENSE)

## Usage

_Install_
```bash
npm install --save node-youtube-downloader
```

_Import_
```javascript
const { download, tag } = require('node-spotify-youtube-downloader');
download(...);
tag(...)
// OR
const downloader = require('node-spotify-youtube-downloader');
downloader.download(...);
downloader.tag(...);
```

_Download_
```javascript
/* Download and tag songs */
download({
  /* URI of item to download
  * Can be retrieved in spotify using right click -> share -> Copy Spotify URI
  * ATM only playlist and album are supported */
  spotifyURI: 'spotify:album:50Zz8CkIhATKUlQMbHO3k1',
  /* Path to download files
  Make sure this folder exists otherwise program will error */
  downloadPath: '../download/',
  /* Spotify web API Token */
  spotifyToken: 'YOUR_TOKEN_HERE',
  /* Range of items to download (1-n) as an array
  Setting to undefined or omitting will cause all tracks to be used */
  range: [2,4]
}).then(() => {console.log('Download complete')}).catch(console.error);
```
_Tag_
```javascript
/* Search for songs as they would be named by program and add the id3 tags from spotify
Options have same syntax as download */
tag({
  spotifyURI: 'spotify:album:50Zz8CkIhATKUlQMbHO3k1',
  downloadPath: '../download/',
  spotifyToken: 'YOUR_TOKEN_HERE',
  range: [2,4]
}).then(() => {console.log('Tagging complete')}).catch(console.error);
```

## TODO
- [ ] Add CLI
- [ ] Improve logging (download progress etc)
- [ ] Improve API
