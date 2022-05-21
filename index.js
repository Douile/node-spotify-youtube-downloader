#!/usr/bin/env node

const name = 'Node Spotify Downloader';
const { version } = require('./package.json');
const { downloadTracks, tagTracks } = require('./src/index.js');
const parseArgs = require('minimist');
const readline = require('readline');

if (!module.parent) {
  var args = parseArgs(process.argv.slice(2), {
    string: ['output','uri','token'],
    alias: {
      'o': 'output',
      's': 'uri',
      't': 'token',
      'v': 'version',
      'u': 'usage',
      'h': 'help',
      'n': 'tag'
    }
  });

  if (args.version) {
    console.log(`${name} v${version}`);
  } else if(args.usage) {
    console.log(`${name} usage:`);
    console.log(`Download - ${processName()} -o <outputdir> -u <uri> -t <token>`);
    console.log(`Help - ${processName()} -h`);
    console.log(`Usage - ${processName()} -u`);
    console.log(`Version - ${processName()} -v`);
  } else if (args.help) {
    console.log(`${name} help:`);
  } else {
    process.on('uncaughtException', (err, origin) => {
      console.error(`Caught exception: ${err}\nException origin: ${origin}`);
    })
    main(args);
  }
}


function processName() {
  let n = process.argv[1],
  s = n.lastIndexOf('/');
  s = s === -1 ? n.lastIndexOf('\\') : s+1;
  s = s === -1 ? 0 : s+1;
  return n.substr(s);
}

async function main({ output, uri, token, tag }) {
  let rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  if (output === undefined) output = await read(rl, 'Enter output directory: ');
  if (uri === undefined) uri = await read(rl, 'Enter Spotify URI: ');
  if (token === undefined) token = await read(rl, 'Enter Spotify Token: ');
  rl.close();
  let method = tag ? tagTracks : downloadTracks;
  try {
    let res = await method({
      spotifyURI: uri,
      downloadPath: output,
      spotifyToken: token
    });
    // console.log(res);
  } catch(e) {
    console.error(e);
  }
  console.log('Download(s) finished...');

}

function read(rl, question) {
  return new Promise((resolve,reject) => {
    try {
      rl.question(question, resolve);
    } catch(e) {
      reject(e);
    }
  })
}


// download({
//   spotifyURI: uri,
//   downloadPath: folder,
//   spotifyToken: token,
//   range: range
// }).then(() => {
//     console.log('Downloads complete');
// }).catch(console.error);
// tag({
//   spotifyURI: uri,
//   downloadPath: folder,
//   spotifyToken: token,
//   range: range
// }).then(() => {
//     console.log('Tagging complete');
// }).catch(console.error);

module.exports = {
  download: downloadTracks,
  tag: tagTracks
}
