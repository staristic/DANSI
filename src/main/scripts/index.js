import '../style/index.scss';
import {ipcRenderer} from 'electron';
import {AnsiCanvas} from './class/AnsiCanvas.js';
import {ImageDisplayer} from './class/imageDisplayer.js';
import {Tag} from './class/tag.js';
import {Tools} from './class/tools.js';
import {triggerEvent, listenEvents, EventList, EventFeature} from './tool/events.js';
import {getHashCode, getFileNameFromFilePath, getFileNameWithoutTypeFromFilePath} from './tool/util.js';
import {getCurrentHash, setCurrentHash} from './tool/global.js';
import {jsonToANSI} from './tool/transfer.js';
import {ipcEvent} from '../../assets/script/ipc.js';
import {keyboard} from '../../assets/script/keyboard.js';

class Root {
  _closeFile(hash) {
    const closeFileByIndex = (index) => {
      this._ansiCanvases[index].distroy();
      this._ansiCanvases.splice(index, 1);
    };

    for (let i = 0, l = this._ansiCanvases.length; i < l; i++) {
      if (this._ansiCanvases[i].hash === hash) {
        if (this._ansiCanvases[i].isSaved) {
          closeFileByIndex(i);
          break;
        } else {
          if (confirm('尚未存檔, 確定關閉？')) {
            closeFileByIndex(i);
          } else {
            return;
          }
        }
      }
    }
    this._tag.removeTag(hash);
  }

  _colorTransfer(data) {
    this._currentAnsi().colorTransfer(data);
  }

  _currentAnsi() {
    const hash = getCurrentHash();
    for (const ansi of this._ansiCanvases) {
      if (ansi.hash === hash) {
        return ansi;
      }
    }
  }

  _focusFile(hash) {
    setCurrentHash(hash);
    for (const ansi of this._ansiCanvases) {
      if (ansi.hash === hash) {
        ansi.show();
        setTimeout(() => {
          ansi.focusInput();
        }, 10);
      } else {
        ansi.hide();
      }
    }
    this._tag.setTagFocus(hash);
  }

  _newFile(file = null) {
    const hash = getHashCode();
    this._tag.newTag(hash, file ? getFileNameFromFilePath(file.path) : undefined);
    this._ansiCanvases.push(new AnsiCanvas(hash, file));
    this._focusFile(hash);
  }

  _onkeydown(e) {
    if (e.ctrlKey && e.keyCode != keyboard.ctrl) {
      triggerEvent(EventList.SHORTCUT_INPUT, e, EventFeature.onlyTriggerCurrentCanvas);
      return;
    }
    switch (e.keyCode) {
      case keyboard.backspace:
        triggerEvent(EventList.BACKSPACE, e, EventFeature.onlyTriggerCurrentCanvas);
        break;
      case keyboard.enter:
        triggerEvent(EventList.ENTER, e, EventFeature.onlyTriggerCurrentCanvas);
        break;
      case keyboard.pageUp:
        triggerEvent(EventList.PAGEUP, e, EventFeature.onlyTriggerCurrentCanvas);
        break;
      case keyboard.pageDown:
        triggerEvent(EventList.PAGEDOWN, e, EventFeature.onlyTriggerCurrentCanvas);
        break;
      case keyboard.end:
        triggerEvent(EventList.END, e, EventFeature.onlyTriggerCurrentCanvas);
        break;
      case keyboard.home:
        triggerEvent(EventList.HOME, e, EventFeature.onlyTriggerCurrentCanvas);
        break;
      case keyboard.left:
        triggerEvent(EventList.LEFT, e, EventFeature.onlyTriggerCurrentCanvas);
        break;
      case keyboard.up:
        triggerEvent(EventList.UP, e, EventFeature.onlyTriggerCurrentCanvas);
        break;
      case keyboard.right:
        triggerEvent(EventList.RIGHT, e, EventFeature.onlyTriggerCurrentCanvas);
        break;
      case keyboard.down:
        triggerEvent(EventList.DOWN, e, EventFeature.onlyTriggerCurrentCanvas);
        break;
      case keyboard.insert:
        triggerEvent(EventList.INSERT, null);
        break;
      case keyboard.delete:
        triggerEvent(EventList.DELETE, null, EventFeature.onlyTriggerCurrentCanvas);
        break;
      default:
        return;
    }
  }

  _openFile() {
    ipcRenderer.send(ipcEvent.OPEN_FILE);
  }

  _pasteToFile(data) {
    this._currentAnsi().getPasteData(data);
  }

  _saveFile() {
    const file = this._currentAnsi();
    ipcRenderer.send(ipcEvent.SAVE_FILE, {
      filePath: file.filePath,
      fileData: jsonToANSI(file.getData()),
      hash: file.hash,
    });
  }

  _showImage() {
    this._imageDisplayer.show(getCurrentHash(),
        getFileNameWithoutTypeFromFilePath(this._currentAnsi().filePath));
  }

  constructor() {
    this._root = document.body; // root is document body
    this._tag = new Tag();
    this._tool = new Tools();
    this._imageDisplayer = new ImageDisplayer();
    this._ansiCanvases = [];
    this._newFile();

    this._root.onkeydown = this._onkeydown;
    this._root.addEventListener('click', () => {
      setTimeout(() => { // wait for other event down
        const ele = document.activeElement;
        if (ele.tagName != 'INPUT' || ele.type === 'radio') {
          triggerEvent(EventList.REQUIRE_FOCUS_INPUT, {}, EventFeature.onlyTriggerCurrentCanvas);
        }
      }, 10);
    });

    listenEvents(EventList.OPEN_FILE, this, '_openFile');
    listenEvents(EventList.SAVE_FILE, this, '_saveFile');
    listenEvents(EventList.NEW_FILE, this, '_newFile');
    listenEvents(EventList.CLOSE_FILE, this, '_closeFile');
    listenEvents(EventList.FOCUS_FILE, this, '_focusFile');
    listenEvents(EventList.SHOW_IMAGE, this, '_showImage');

    ipcRenderer.on(ipcEvent.SAVE_FILE_SUCCESS, (event, data) => {
      for (const ansi of this._ansiCanvases) {
        if (ansi.hash === data.hash) {
          ansi.filePath = data.filePath;
          ansi.setSaved();
          break;
        }
      }
      for (const fileTag of this._root.getElementsByClassName('file-tag')) {
        if (fileTag.dataset.hash === data.hash) {
          fileTag.innerHTML = getFileNameFromFilePath(data.filePath);
          break;
        }
      }
    });

    ipcRenderer.on(ipcEvent.COLOR_TRANSFER, (event, data) => {
      this._colorTransfer(data);
    });

    ipcRenderer.on(ipcEvent.SYMBOL_INPUT, (event, data) => {
      triggerEvent(EventList.INPUT, data, EventFeature.onlyTriggerCurrentCanvas);
    });

    ipcRenderer.on(ipcEvent.GET_PASTE, (event, data) => {
      this._pasteToFile(data);
    });

    ipcRenderer.on(ipcEvent.OPEN_FILE_SUCCESS, (event, fileInfo) => {
      this._newFile(fileInfo);
    });

    ipcRenderer.on(ipcEvent.KEYDOWN_FROM_CHILD, (event, data) => {
      this._onkeydown(data);
    });
  }
}

new Root();
