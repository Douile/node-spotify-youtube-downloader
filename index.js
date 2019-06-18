#!/usr/bin/env node

const name = 'Node Spotify Downloader';
const { version } = require('./package.json');
const { download, tag } = require('./src/main.js');
const parseArgs = require('minimist');
const readline = require('readline');

var args = parseArgs(process.argv.slice(2), {
  string: ['output','uri','token'],
  alias: {
    'o': 'output',
    'u': 'uri',
    't': 'token',
    'v': 'version',
    'u': 'usage',
    'h': 'help'
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
  main(args);
}

function processName() {
  let n = process.argv[1],
  s = n.lastIndexOf('/');
  s = s === -1 ? n.lastIndexOf('\\') : s+1;
  s = s === -1 ? 0 : s+1;
  return n.substr(s);
}

async function main({ output, uri, token }) {
  let rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  if (output === undefined) output = await read(rl, 'Enter output directory: ');
  if (uri === undefined) uri = await read(rl, 'Enter Spotify URI: ');
  if (token === undefined) token = await read(rl, 'Enter Spotify Token: ');
  rl.close();
  await download({
    spotifyURI: uri,
    downloadPath: output,
    spotifyToken: token
  })
  console.log('Download(s) done...');
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
  download: download,
  tag: tag
}
