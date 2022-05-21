function escapeFileName(str) {
    return str.replace(/[\\\/\:\*\?\"\<\>\|\']/g, " ").replace(/\s\s+/g, ' ').trim();
}

function concurrentAsync(collection, threads, iteree, onEachFinish) {
  return new Promise( async function(resolve,reject) {
    const active = [];
    const data = new Array(collection.length);
    var i = 0, done = 0;
    while (i < collection.length) {
      while (active.length < threads) {
        const index = i;
        i++;
        let input = collection[index];
        const promise = iteree(input, index);
        active.push(promise);
        let onComplete = (result) => {
          active.splice(active.indexOf(promise));
          data[index] = result;
          if (onEachFinish !== undefined) onEachFinish(result);
          done++;
          console.log(`Finished ${done}/${collection.length}`);
          if (done >= collection.length) resolve(data);
        }
        promise.then(onComplete).catch(onComplete);
        // console.log(`Started ${index}`);
      }
      await timeout(2);
    }
  })
}

function timeout(time) {
  return new Promise((resolve,reject) => {
    setTimeout(resolve,time);
  })
}

function normalizeTracks(tracks,downloadPath) {
  let normailized = [];
  for (let track of tracks) {
    track.name = `${track.artist} - ${track.track_name}`;
    track.fileName = `${escapeFileName(track.name)}.mp3`;
    track.path = downloadPath === null ? null : `${downloadPath}/${track.fileName}`;
    normailized.push(track);
  }
  return normailized;
}

module.exports = {
  escapeFileName: escapeFileName,
  concurrentAsync: concurrentAsync,
  timeout: timeout,
  normalizeTracks: normalizeTracks
}
