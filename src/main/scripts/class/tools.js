import {listenEvents, EventList} from '../tool/events.js';
import {Palette} from './palette.js';
import {setInputMode, getInputMode, toggleInputMode, setColor, setShortcutMode} from '../tool/global.js';
import {ipcRenderer} from 'electron';
import {ipcEvent} from '../../../assets/script/ipc.js';
const classOfHidden = 'hidden';
const clickEvent = {
  displayShortcut: 'displayShortcut',
  inputmode: 'inputmode',
  popup: 'popup',
  shortcut: 'shortcut',
};
const popupName = {
  about: 'about',
  colorTransferTool: 'color-transfer-tool',
  setting: 'setting',
  symbolInputTool: 'symbol-input-tool',
};

export const Tools = class Tools {
  openPopup(target) {
    switch (target) {
      case popupName.about:
        ipcRenderer.send(ipcEvent.OPEN_ABOUT);
        break;
      case popupName.colorTransferTool:
        ipcRenderer.send(ipcEvent.OPEN_COLOR_TRANSFER_TOOL);
        break;
      case popupName.symbolInputTool:
        ipcRenderer.send(ipcEvent.OPEN_SYMBOL_INPUT_TOOL);
        setTimeout(() => { // set brick color
          setColor();
        }, 500);
        break;
      case 'setting':
        // TODO: setting tool
        break;
    }
  }

  toggleInputMode() {
    toggleInputMode();
    this._root.querySelectorAll(`[data-value=${getInputMode()}]`)[0].checked = true;
  }

  toogleShortcut() {
    if (this._shortcut.classList.contains(classOfHidden)) {
      this._shortcut.classList.remove(classOfHidden);
    } else {
      this._shortcut.classList.add(classOfHidden);
    }
  }

  constructor() {
    this._root = document.getElementById('tool-bar');
    this._palette = new Palette(this._root.querySelectorAll('.main-palette')[0]);
    this._shortcut = this._root.getElementsByClassName('shortcut')[0];
    this._root.addEventListener('click', (e) => {
      const clickInfo = e.target.dataset;
      switch (clickInfo.type) {
        case clickEvent.inputmode:
          setInputMode(clickInfo.value);
          break;
        case clickEvent.displayShortcut:
          this.toogleShortcut();
          break;
        case clickEvent.shortcut:
          setShortcutMode(clickInfo.value);
          break;
        case clickEvent.popup:
          this.openPopup(clickInfo.target);
          break;
        default:
          return;
      }
    });
    listenEvents(EventList.INSERT, this, 'toggleInputMode');
  }
};
