/* eslint-env node */
const {BrowserWindow} = require('electron');
const popupName = {
  colorTransferTool: 'colorTransferTool',
  about: 'about',
  symbolInputTool: 'symbolInputTool',
};

module.exports.popupName = popupName;

const DEFAULT_WIN_OPTIONS = {
  webPreferences: {
    nodeIntegration: true,
    // FIXME: switch to preload scripts
    contextIsolation: false,
    enableRemoteModule: true,
  },
};
module.exports.DEFAULT_WIN_OPTIONS = DEFAULT_WIN_OPTIONS;

const openPopupStatus = {
  about: {
    windowOptions: {
      transparent: true,
      width: 400,
      height: 200,
    },
    menu: null,
    isOpening: false,
  },
  colorTransferTool: {
    windowOptions: {
      transparent: true,
      width: 230,
      height: 360,
    },
    isHalfOpacity: true,
    menu: null,
    isOpening: false,
  },
  symbolInputTool: {
    windowOptions: {
      transparent: true,
      width: 700,
      height: 250,
    },
    isHalfOpacity: true,
    menu: null,
    isOpening: false,
  },
};

module.exports.openPopup = (rootWindow, name) => {
  if (openPopupStatus[name].isOpening) {
    return;
  }
  openPopupStatus[name].isOpening = true;
  openPopupStatus[name].windowOptions.parent = rootWindow;
  const popup = new BrowserWindow({
    ...DEFAULT_WIN_OPTIONS,
    ...openPopupStatus[name].windowOptions,
  });
  if (openPopupStatus[name].isHalfOpacity) {
    popup.on('focus', () => {
      popup.setOpacity(1);
    });
    popup.on('blur', () => {
      popup.setOpacity(0.5);
    });
  }
  popup.on('close', () => {
    openPopupStatus[name].isOpening = false;
    openPopupStatus.window = null;
  });
  // open it if need
  // popup.webContents.openDevTools();
  popup.setMenu(openPopupStatus[name].menu);
  popup.loadURL(`file://${__dirname}/../dist/popup/${name}.html`);
  popup.show();
  openPopupStatus[name].win = popup;
  if (process.argv.includes('dev')) {
    popup.webContents.openDevTools();
  }
};

module.exports.sendEventToPopup = (targetWindows, eventName, data) => {
  for (const win of targetWindows) {
    if (openPopupStatus[win].isOpening) {
      openPopupStatus[win].win.webContents.send(eventName, data);
    }
  }
};
