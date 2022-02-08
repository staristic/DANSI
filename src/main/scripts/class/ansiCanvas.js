import {ipcRenderer} from 'electron';
import {Sensor} from './sensor.js';
import {AnsiModel, editType} from './ansiModel.js';
import {BackgroundImage} from './backgroundImage.js';
import {Zoom} from './zoom.js';
import {listenEvents, triggerEvent, EventList} from '../tool/events.js';
import {ansiFileToJson, jsonToANSI, stringToJson} from '../tool/transfer.js';
import {getColor, getBackgroundColor, getBright, getShortcutMode} from '../tool/global.js';
import {getShortcutWord, keycodeDirect} from '../tool/shortcut.js';
import {canvasTemplate} from '../../templates/canvasTemplate.js';
import {ipcEvent} from '../../../assets/script/ipc.js';
import {keyboard} from '../../../assets/script/keyboard.js';

export const AnsiCanvas = class AnsiCanvas {
  backspace() {
    this._model.edit(editType.BACKSPACE, this._sensor.getSensorStatus());
  }

  breakLine() {
    this._model.edit(editType.BREAKLINE, this._sensor.getSensorStatus());
  }

  colorTransfer(info) {
    if (!this._sensor.isSelecting) {
      return;
    }
    const dataColor = {
      condition: {},
      target: {},
    };
    if (info.before.backgroundSelected) {
      dataColor.condition.background = info.before.background;
    }
    if (info.before.colorSelected) {
      dataColor.condition.color = info.before.color;
      dataColor.condition.bright = info.before.bright;
    }
    if (info.after.backgroundSelected) {
      dataColor.target.background = info.after.background;
    }
    if (info.after.colorSelected) {
      dataColor.target.color = info.after.color;
      dataColor.target.bright = info.after.bright;
    }
    this._model.edit(editType.COLOR, this._sensor.getSensorStatus(), dataColor);
  }

  copy(sensorStatus) {
    const selectedData = [];
    const range = sensorStatus.range || null;
    if (!range) {
      return;
    }
    for (let y = range.from.row, i = 0; y <= range.to.row; y++, i++) {
      selectedData.push([]);
      for (let x = range.from.col; x <= range.to.col; x++) {
        selectedData[i].push(this._model.getDataByPosition(y, x));
      }
    }
    ipcRenderer.send(ipcEvent.COPY, jsonToANSI(selectedData));
  }

  copyAll() {
    ipcRenderer.send(ipcEvent.COPY, jsonToANSI(this._model.getAllData()));
  }

  cut(sensorStatus) {
    this.copy(sensorStatus);
    this.deleteSth(sensorStatus);
  }

  dealInput(data, direct = null) {
    if (!data) throw new Error('no data')
    this._model.edit(editType.INPUT, this._sensor.getSensorStatus(), data.word, direct);
  }

  deleteSth(positionInfo = null) {
    this._model.edit(editType.DELETE, positionInfo || this._sensor.getSensorStatus());
  }

  distroy() {
    this.root.parentNode.removeChild(this.root);
  }

  down() {
    if (!this._sensor.isInputFocus()) {
      return;
    }
    this._sensor.setCursorPositionByRowCol(Math.min(this._sensor.currentRow + 1, this._model.getFileHeight() - 1), this._sensor.currentCol,
        this._model.getDataByPosition(Math.min(this._sensor.currentRow + 1, this._model.getFileHeight() - 1), this._sensor.currentCol));
  }

  edited() {
    this.setUnsaved();
  }

  end() {
    if (!this._sensor.isInputFocus()) {
      return;
    }
    this._sensor.setCursorPositionByRowCol(this._sensor.currentRow, this.fileWidth - 1,
        this._model.getDataByPosition(this._sensor.currentRow, this.fileWidth - 1));
  }

  focusInput() {
    this._sensor.focusInput();
  }

  getData() {
    return this._model.getAllData();
  }

  getPasteData(data) {
    const pasteInfo = typeof data === 'string' ? stringToJson(data) : ansiFileToJson(data);
    this._model.edit(editType.PASTE, this._sensor.getSensorStatus(), pasteInfo);
  }

  hide() {
    this.root.classList.remove('focus');
  }

  home() {
    if (!this._sensor.isInputFocus()) {
      return;
    }
    this._sensor.setCursorPositionByRowCol(this._sensor.currentRow, 0,
        this._model.getDataByPosition(this._sensor.currentRow, 0));
  }

  left() {
    if (!this._sensor.isInputFocus()) {
      return;
    }
    this._sensor.setCursorPositionByRowCol(this._sensor.currentRow, Math.max(this._sensor.currentCol - 1, 0),
        this._model.getDataByPosition(this._sensor.currentRow, Math.max(this._sensor.currentCol - 1, 0)));
  }

  pageDown() {
    // TODO: pageDown scroll. 23 rows or whole view per scroll?
  }

  pageUp() {
    // TODO: pageUp scroll. 23 rows or whole view per scroll?
  }

  paste() {
    ipcRenderer.send(ipcEvent.PASTE);
  }

  redo() {
    const redoResult = this._model.redo();
    if (redoResult === null) {
      return;
    }
    if (redoResult) {
      this.setSaved();
    } else {
      this.setUnsaved();
    }
  }

  right() {
    if (!this._sensor.isInputFocus()) {
      return;
    }
    this._sensor.setCursorPositionByRowCol(this._sensor.currentRow, Math.min(this._sensor.currentCol + 1, this.fileWidth - 1),
        this._model.getDataByPosition(this._sensor.currentRow, Math.min(this._sensor.currentCol + 1, this.fileWidth - 1)));
  }

  setBackgroundColor() {
    this._model.edit(editType.COLOR, this._sensor.getSensorStatus(), {
      target: {
        background: getBackgroundColor(),
      },
    });
  }

  setColor() {
    this._model.edit(editType.COLOR, this._sensor.getSensorStatus(), {
      target: {
        color: getColor(),
        bright: getBright(),
      },
    });
  }

  setCursor(positionInfo) {
    this._sensor.setCursorPositionByRowCol(positionInfo.row, positionInfo.col,
        this._model.getDataByPosition(positionInfo.row, positionInfo.col));
  }

  setMouse(coordinateData) {
    this._sensor.setCursorPositionByMouse(coordinateData.offsetX, coordinateData.offsetY,
        this._model.getDataByPosition(Math.floor(coordinateData.offsetY / coordinateData.heightRate), Math.floor(coordinateData.offsetX / coordinateData.widthRate)));
  }

  setSaved() {
    this.isSaved = true;
    this._model.setRecordSaved();
    triggerEvent(EventList.FILE_SAVED, this.hash);
  }

  setUnsaved() {
    this.isSaved = false;
    triggerEvent(EventList.FILE_UNSAVED, this.hash);
  }

  setZoomRate(rate) {
    this._sensor.setZoomRate(this._model.getFileHeight(), this._model.getFileWidth(), rate);
    this._model.setZoomRate(rate);
    this.backgroundImage.setZoomRate(rate);
  }

  shortcutInput(keyInfo) {
    const row = this._sensor.currentRow;
    const col = this._sensor.currentCol;

    const getNeiborWord = (neiborRow, neiborCol) => {
      if (neiborRow < 0 || neiborRow >= this._model.getFileHeight()) {
        return '';
      }
      if (neiborCol < 0 || neiborCol >= this._model.getFileWidth()) {
        return '';
      }
      const data = this._model.getDataByPosition(neiborRow, neiborCol);
      return data.right ? '' : data.word;
    };
    const neibor = {
      up: getNeiborWord(row - 1, col),
      down: getNeiborWord(row + 1, col),
      left: getNeiborWord(row, col - 2),
      right: getNeiborWord(row, col + 2),
      self: this._model.getDataByPosition(row, col).word,
    };
    const mode = getShortcutMode();
    const direct = {
      rowDiff: mode === 0 ? 0 : (keyInfo.keyCode === keyboard.up ? -1 : (keyInfo.keyCode === keyboard.down ? 1 : 0)),
      colDiff: mode === 0 ? 0 : (keyInfo.keyCode === keyboard.left ? -2 : (keyInfo.keyCode === keyboard.right ? 2 : 0)),
    };
    const word = getShortcutWord(mode, neibor, keycodeDirect[keyInfo.keyCode]);
    if (word == null) {
      return;
    } else {
      this.dealInput({word: word}, direct);
    }
  }

  show() {
    this.root.classList.add('focus');
  }

  sizechange() {
    const row = this._model.getFileHeight();
    const col = this._model.getFileWidth();
    this.fileWidth = col;
    this._sensor.setSize(row, col);
  }

  undo() {
    const undoResult = this._model.undo();
    if (undoResult === null) {
      return;
    }
    if (undoResult) {
      this.setSaved();
    } else {
      this.setUnsaved();
    }
  }

  up(e) {
    if (!this._sensor.isInputFocus()) {
      return;
    }
    if (e.shiftKey) {
      // FIXME: empty block
    } else {
      this._sensor.setCursorPositionByRowCol(Math.max(this._sensor.currentRow -1, 0), this._sensor.currentCol,
          this._model.getDataByPosition(Math.max(this._sensor.currentRow -1, 0), this._sensor.currentCol));
    }
  }

  constructor(hash, file) {
    this.hash = hash;
    this.isSaved = true;
    this.filePath = file ? file.path : null;
    this.fileWidth = 80;
    this.root = document.createElement('div');
    this.root.className = `ansi-canvas ansi-canvas-${hash}`;
    this.root.innerHTML = canvasTemplate;

    const parent = document.getElementById('canvas-block');
    parent.appendChild(this.root);
    const fileData = file ? ansiFileToJson(file.data) : [[]];
    setTimeout(() => {
      this.currentCanvas = this.root.getElementsByClassName('current-canvas')[0];
      this._model =
          new AnsiModel(this.root.getElementsByClassName('canvas-area')[0], fileData);
      this._sensor = new Sensor(this.root, fileData);
      this.backgroundImage = new BackgroundImage(this.root.querySelectorAll('.background-image-setting')[0], this.root.querySelectorAll('img')[0]);
      this._zoom = new Zoom(this.root.querySelectorAll('.zoom')[0]);
      this.sizeManager = this.root.getElementsByClassName('current-size')[0];
    }, 10);

    listenEvents(EventList.BACKSPACE, this, 'backspace');
    listenEvents(EventList.COPY, this, 'copy');
    listenEvents(EventList.COPY_ALL, this, 'copyAll');
    listenEvents(EventList.CUT, this, 'cut');
    listenEvents(EventList.DELETE, this, 'deleteSth');
    listenEvents(EventList.DOWN, this, 'down');
    listenEvents(EventList.EDITED, this, 'edited');
    listenEvents(EventList.END, this, 'end');
    listenEvents(EventList.ENTER, this, 'breakLine');
    listenEvents(EventList.HOME, this, 'home');
    listenEvents(EventList.INPUT, this, 'dealInput');
    listenEvents(EventList.LEFT, this, 'left');
    listenEvents(EventList.MOUSE_TRIGGERED, this, 'setMouse');
    listenEvents(EventList.PAGEDOWN, this, 'pageDown');
    listenEvents(EventList.PAGEUP, this, 'pageUp');
    listenEvents(EventList.PASTE, this, 'paste');
    listenEvents(EventList.REDO, this, 'redo');
    listenEvents(EventList.REQUIRE_CARET_SET, this, 'setCursor');
    listenEvents(EventList.REQUIRE_FOCUS_INPUT, this, 'focusInput');
    listenEvents(EventList.RIGHT, this, 'right');
    listenEvents(EventList.SIZE_CHANGE, this, 'sizechange');
    listenEvents(EventList.SET_BACKGROUND_COLOR, this, 'setBackgroundColor');
    listenEvents(EventList.SET_COLOR, this, 'setColor');
    listenEvents(EventList.SHORTCUT_INPUT, this, 'shortcutInput');
    listenEvents(EventList.UNDO, this, 'undo');
    listenEvents(EventList.UP, this, 'up');
    listenEvents(EventList.ZOOM, this, 'setZoomRate');
  }
};
