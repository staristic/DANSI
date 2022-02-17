/* eslint-env node */
const {dialog, BrowserWindow} = require('electron');
const fs = require('fs');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const fileOptionsSetting = {
  filters: [{
    name: 'ANSI',
    extensions: ['ans', 'ansi'],
  }],
};

module.exports.saveData = async (data) => {
  if (!data.filePath) {
    const result = await dialog.showSaveDialog(fileOptionsSetting);
    if (result.canceled) return {canceled: true};
    data.filePath = result.filePath;
  }
  const saveData = Buffer.alloc(data.fileData.length);
  for (let i = 0, l = data.fileData.length; i < l; i++) {
    saveData[i] = data.fileData[i];
  }
  await writeFileAsync(data.filePath, saveData);
  return {filePath: data.filePath};
};

module.exports.readFile = async () => {
  const win = BrowserWindow.getFocusedWindow();
  const {canceled, filePaths} = await dialog.showOpenDialog(win, fileOptionsSetting);
  if (canceled) return {canceled: true};
  const result = await readFileAsync(filePaths[0]);
  return {
    path: filePaths[0],
    data: result,
  };
};
