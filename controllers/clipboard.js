/* eslint-env node */
const platform = process.platform;
const {clipboard} = require('electron');

const checkIfContainANSICode = (buffer) => {
  let i = 0;
  const l = buffer.length;
  while (i < l - 2) {
    if (buffer[i] === 27 && buffer[i + 1] === 91) {
      i += 2;
      while (buffer[i] === 59 || (48 <= buffer[i] && buffer[i] <= 57)) {
        i++;
      }
      if (buffer[i] === 109) {
        return true;
      }
    }
    i++;
  }
  return false;
};

if (platform === 'win32') {
  // c++ addon of clipboard
  const addon = require('../addon/build/Release/addon');

  module.exports.writeDataIntoClipBoardData = (data) => {
    addon.writeDataIntoClipBoardData(data);
  };

  module.exports.getClipBoardData = async () => {
    // NOTE: we have to pass the raw bytes so DANSI can decode big5uao
    return addon.getClipBoardData();
  };
} else if (platform === 'darwin') {
  // TODO: resolve clipboard access problem on macOS
  let tempClipboardOnMac = '';

  module.exports.writeDataIntoClipBoardData = (data) => {
    tempClipboardOnMac = data;
  };

  module.exports.getClipBoardData = async () => {
    return tempClipboardOnMac;
  };
}
