const platform = process.platform;
if (platform === 'win32') {
  // c++ addon of clipboard
  const addon = require('../addon/build/Release/addon');

  module.exports.writeDataIntoClipBoardData = (data) => {
    addon.writeDataIntoClipBoardData(data);
  };

  module.exports.getClipBoardData = async () => {
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
