// c++ addon of clipboard
const addon = require('../addon/build/Release/addon');

module.exports.writeDataIntoClipBoardData = (data) => {
  addon.writeDataIntoClipBoardData(data);
};

module.exports.getClipBoardData = async () => {
  return addon.getClipBoardData();
};
