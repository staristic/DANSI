/* eslint-env node */
const {app, BrowserWindow, ipcMain, shell, dialog} = require('electron');
const clipboard = require('./controllers/clipboard.js');
const file = require('./controllers/file.js');
const {getSymbolConfig, saveSymbolConfig} = require('./controllers/symbol.js');
const {popupName, openPopup, sendEventToPopup, DEFAULT_WIN_OPTIONS} = require('./controllers/popup.js');

let rootWindow;

const callPopup = (popupName) => {
  return () => {
    openPopup(rootWindow, popupName);
  };
};

const colorTransfer = (event, data) => {
  rootWindow.webContents.send('color-transfer', data);
};

const copyANSI = (event, data) => {
  clipboard.writeDataIntoClipBoardData(data);
};

const createMainWindow = () => {
  let win = new BrowserWindow({
    icon: `file://${__dirname}/assets/icons/DANSI.ico`,
    ...DEFAULT_WIN_OPTIONS,
  });
  win.setMenu(null);
  win.loadURL(`file://${__dirname}/index.html`);
  win.maximize();

  if (process.argv.includes('dev')) {
    win.webContents.openDevTools();
  }

  win.onbeforeunload = (e) => {
    // TODO: check all file if saved before closed, but this feature not work with unknown reason.
    // e.returnValue = false
  };

  win.on('closed', (e) => {
    win = null;
  });
  rootWindow = win;
};

const openFile = async (event) => {
  try {
    const fileInfo = await file.readFile();
    // TODO: only open one file now. will support multiple files.
    if (fileInfo) {
      event.sender.send('get-open-file', fileInfo);
    } else {
      throw new Error('無法取得檔案資訊');
    }
  } catch (e) {
    console.error(e);
    dialog.showErrorBox('開檔失敗', e?.message || String(e));
  }
};

const openLink = (e, link) => {
  shell.openExternal(link);
};

const passKeycode = (event, data) => {
  rootWindow.webContents.send('keydown-from-child', data);
};

const pasteANSI = async (event) => {
  try {
    const ansi = await clipboard.getClipBoardData();
    event.sender.send('get-paste', ansi);
  } catch (e) {
    console.log(e);
  }
};

const quitApp = () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
};

const requireSymbolData = async () => {
  const symbols = await getSymbolConfig();
  sendEventToPopup([popupName.symbolInputTool], 'get-symbol-data', symbols);
};

const saveFile = async (event, data) => {
  try {
    const savedFilePath = await file.saveData(data);
    if (savedFilePath) {
      event.sender.send('save-success', {
        hash: data.hash,
        filePath: savedFilePath,
      });
    } else {
      throw new Error('無法取得檔案路徑');
    }
  } catch (e) {
    dialog.showErrorBox('存檔失敗', e);
  }
};

const saveSymbolData = async (e, data) => {
  saveSymbolConfig(data);
};

const setGlobalColor = (event, colorInfo) => {
  sendEventToPopup([popupName.symbolInputTool], 'set-global-color', colorInfo);
};

const symbolInput = (event, data) => {
  rootWindow.webContents.send('symbol-input', data);
};

app.on('ready', createMainWindow);
app.on('window-all-closed', quitApp);

ipcMain.on('copy', copyANSI);
ipcMain.on('color-transfer', colorTransfer);
ipcMain.on('keydown-from-child', passKeycode);
ipcMain.on('open', openFile);
ipcMain.on('open-about', callPopup(popupName.about));
ipcMain.on('open-color-transfer-tool', callPopup(popupName.colorTransferTool));
ipcMain.on('open-link', openLink);
ipcMain.on('open-symbol-input-tool', callPopup(popupName.symbolInputTool));
ipcMain.on('paste', pasteANSI);
ipcMain.on('require-symbol-data', requireSymbolData);
ipcMain.on('save', saveFile);
ipcMain.on('save-symbol-data', saveSymbolData);
ipcMain.on('set-global-color', setGlobalColor);
ipcMain.on('symbol-input', symbolInput);
