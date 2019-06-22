const fetch = require('node-fetch');
const readline = require('readline');

const URL_YT_SEARCH = function(apikey, query) {return `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&order=relevance&q=${encodeURIComponent(query)}&type=video&key=${encodeURIComponent(apikey)}`};
const URL_SEARCH = function(query) {return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&pbj=1`};

const HEADERS_YOUTUBE = {
  'Accept': '*/*',
  'Referer': 'https://www.youtube.com/results?search_query=Youtube',
  'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; rv:60.0) Gecko/20100101 Firefox/60.0',
  'X-YouTube-STS': '18060',
  'X-YouTube-Client-Name': '1',
  'X-YouTube-Client-Version': '2.20190613',
  'X-YouTube-Page-CL': '253062866',
  'X-YouTube-Page-Label': 'youtube.ytfe.desktop_20190612_3_RC1',
  'X-YouTube-Variants-Checksum': '31a85be42fa87bf76e6ac4b4bb577b5d',
  'X-YouTube-UTC-Offset': '0',
  'X-SPF-Referer': 'https://www.youtube.com/results?search_query=Youtube',
  'X-SPF-Previous': 'https://www.youtube.com/results?search_query=Youtube'
};

var abuseKey = null;

function searchYoutubeVideo(key, token, query) {
  return new Promise((resolve,reject) => {
    fetch(URL_YT_SEARCH(key, query),{ headers: { 'Accept': 'application/json' }}).then((res) => {
      res.json().then((json) => {
        if (json['items'] === undefined) return reject(`Bad search response ${JSON.stringify(json)}`);
        if (json.items.length > 0) {
          resolve({ id: json.items[0].id.videoId, title: json.items[0].snippet.title });
        } else {
          reject(new Error('No results'));
        }
      }).catch(reject);
    }).catch(reject);
  })
}

function searchYoutubeVideoNonAPI(query) {
  return new Promise((resolve,reject) => {
    const url = URL_SEARCH(query);
    const url_object = new URL(url);
    let headers = HEADERS_YOUTUBE;
    if (abuseKey !== null) {
      headers['Cookie'] = `GOOGLE_ABUSE_EXEMPTION=${abuseKey};`;
    }
    fetch(url, { headers: HEADERS_YOUTUBE }).then((res) => {
      let res_object = new URL(res.url);
      if (res_object.host === url_object.host && res_object.pathname == url_object.pathname) {
        res.json().then((json) => {
          for (let item of json) {
            if (item.page === 'search' && item.response !== undefined) {
              let video = item.response.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].videoRenderer;
              return resolve({ id: video.videoId, title: video.title.simpleText });
            }
          }
        }).catch(reject);
      } else {
        console.log(`Redirected to ${res.url}`);
        return getAbuseKey().then(() => {searchYoutubeVideoNonAPI(query).then(resolve).catch(reject)}).catch(reject);
      }
    }).catch(reject);
  })
}

function getAbuseKey() {
  return new Promise((resolve,reject) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Enter google abuse key (https://www.youtube.com/results?search_query=My+Generic+Youtube+Search): ',(answer) => {
      rl.close();
      abuseKey = answer;
      resolve(answer);
    })
  })
}

module.exports = {
  searchYoutubeVideo: searchYoutubeVideo,
  searchYoutubeVideoNative: searchYoutubeVideoNonAPI
}
