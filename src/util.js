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
        const promise = iteree(input);
        active.push(promise);
        let onComplete = (result) => {
          active.splice(active.indexOf(promise));
          data[index] = result;
          if (onEachFinish !== undefined) onEachFinish(result);
          done++;
          console.log(`Finished ${index}`);
          if (done >= collection.length) resolve(data);
        }
        promise.then(onComplete).catch(onComplete);
        console.log(`Started ${index}`);
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

module.exports = {
  escapeFileName: escapeFileName,
  concurrentAsync: concurrentAsync
}
