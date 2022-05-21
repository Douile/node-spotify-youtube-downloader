const { Readable } = require('stream');
const { createWriteStream } = require('fs');

const { concurrentAsync } = require('./util.js');

const generatePlaylist = function(trackData, playlistName) {
  const stream = new Readable();
  stream._read = () => {};
  _generatePlaylist(stream, trackData, playlistName);
  return stream;
}

const _generatePlaylist = async function(stream, trackData, playlistName) {
  stream.push(`#EXTM3U\n#PLAYLIST:${playlistName}\n\n`);
  await concurrentAsync(trackData, 25, generatePlaylistItem(stream), undefined);
  stream.push(null);
}

const generatePlaylistItem = function(stream) {
  return async function(trackItem, trackNo) {
    stream.push(`#EXTINF:${trackNo},${trackItem.name}\n${trackItem.fileName}\n\n`);
  }
}

const writePlaylistFile = function(trackData, playlistName, playlistFile) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(playlistFile, { encoding: 'utf8', emitClose: true });
    const output = generatePlaylist(trackData, playlistName);
    output.once('end', resolve);
    output.on('error', reject);
    output.pipe(file);
  })
}

exports.generatePlaylist = generatePlaylist;
exports.writePlaylistFile = writePlaylistFile;
