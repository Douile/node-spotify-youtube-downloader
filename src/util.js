function escapeFileName(str) {
    return str.replace(/[\\\/\:\*\?\"\<\>\|\']/g, " ").replace(/\s\s+/g, ' ').trim();
}

module.exports = {
  escapeFileName: escapeFileName
}
