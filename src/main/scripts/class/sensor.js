import {triggerEvent, EventList, EventFeature} from '../tool/events.js';
import {unitWidth} from '../../../assets/script/specialCode.js';
import {getInputMode} from '../tool/global.js';
import {remote} from 'electron';
const {Menu, MenuItem} = remote;
const classOfSelecting = 'selecting';
const cursorClass = {
  double: 'double',
  left: 'left',
  right: 'right',
};

export const Sensor = class Sensor {
  focusInput() {
    this._input.focus();
  }

  getSensorStatus() {
    return {
      isSelecting: this.isSelecting,
      row: this.currentRow,
      col: this.currentCol,
      range: !this.isSelecting ? null : {
        from: {
          row: this._startRow <= this._endRow ? this._startRow : this._endRow,
          col: this._startCol <= this._endCol ? this._startCol : this._endCol,
        },
        to: {
          row: this._startRow > this._endRow ? this._startRow : this._endRow,
          col: this._startCol > this._endCol ? this._startCol : this._endCol,
        },
      },
    };
  }

  isInputFocus() {
    return this._input === document.activeElement;
  }

  setCursorPositionByMouse(x = 0, y = 0, currentPositionDataInfo) {
    this.currentRow = Math.floor(y / this._heightRate());
    this.currentCol = Math.floor(x / this._widthRate());
    this._setPointerPosition(currentPositionDataInfo);
    this._updateStatusPanel();
  }

  setCursorPositionByRowCol(row = this.currentRow, col = this.currentCol, currentPositionDataInfo) {
    this.currentRow = row === null ? this.currentRow : row;
    this.currentCol = col === null ? this.currentCol : col;
    this._setPointerPosition(currentPositionDataInfo);
    this._updateStatusPanel();
    this._resetSelect();
    this.focusInput();
  }

  setSize(row = 1, col = 80) {
    this._root.style.height = `${row * this._rate * 2}px`;
    this._root.style.width = `${col * this._rate}px`;
    const [width, height] = this._currentSizePanel.getElementsByTagName('b');
    width.innerHTML = col;
    height.innerHTML = row;
  }

  setZoomRate(row, col, rate) {
    this._rate = rate;
    this.setSize(row, col);
    this._resetPointerSize();
    this._setPointerPosition();
  }

  _heightRate() {
    return this._rate * 2;
  }

  _updateStatusPanel() {
    const data = this._cursorPositionPanel.getElementsByTagName('b');
    let text;
    if (this.isSelecting) {
      text = `${this._startRow}, ${this._startCol} ~ ${this._endRow}, ${this._endCol} | ${Math.abs(this._endRow - this._startRow) + 1} ✕ ${Math.abs(this._endCol - this._startCol) + 1}`;
    } else {
      text = `${this.currentRow}, ${this.currentCol}`;
    }
    data[0].innerHTML = text;
  }

  _resetPointerSize() {
    this._pointer.style.height = `${this._heightRate() - 2}px`;
    this._pointer.style.width = `${this._widthRate()}px`;
    this._input.style.height = `${this._heightRate()}px`;
    this._input.style.fontSize = `${this._heightRate()}px`;
  }

  _resetSelect() {
    this.isSelecting = false;
    this._pointer.classList.remove(classOfSelecting);
    this._resetPointerSize();
  }

  _setPointerPosition(currentPositionDataInfo) {
    this._pointer.style.top = `${this.currentRow * this._rate * 2}px`;
    this._pointer.style.left = `${this.currentCol * this._rate}px`;
    if (!currentPositionDataInfo) {
      return;
    }
    this._pointer.classList.remove(cursorClass.double, cursorClass.right, cursorClass.left);
    if (!currentPositionDataInfo.isAscii) {
      if (currentPositionDataInfo.right) {
        this._pointer.classList.add(cursorClass.double, cursorClass.right);
      } else {
        this._pointer.classList.add(cursorClass.double, cursorClass.left);
      }
    }
  }

  _setSelectorStart(x = 0, y = 0) {
    this._startCol = Math.floor(x / this._widthRate());
    this._startRow = Math.floor(y / this._heightRate());
    this._setSelectorEnd(x, y);
  }

  _setSelectorEnd(x = 0, y = 0) {
    const widthRate = this._widthRate();
    const heightRate = this._heightRate();
    this.isSelecting = true;
    this._endCol = Math.floor(x / widthRate);
    this._endRow = Math.floor(y / heightRate);
    this._pointer.style.top = `${Math.min(this._startRow, this._endRow) * heightRate}px`;
    this._pointer.style.left = `${Math.min(this._startCol, this._endCol) * widthRate}px`;
    this._pointer.style.height = `${(Math.abs(this._startRow - this._endRow) + 1) * heightRate - 4}px`;
    this._pointer.style.width = `${(Math.abs(this._startCol - this._endCol) + 1) * widthRate - 4}px`;
    this._pointer.classList.add(classOfSelecting);
    this._updateStatusPanel();
  }

  _widthRate() {
    return this._rate;
  }

  constructor(parent, initialData = [[]]) {
    this._root = parent.getElementsByClassName('sensor')[0];
    this._sensor = parent.getElementsByClassName('touch-panel')[0];
    this._input = parent.getElementsByTagName('input')[0];
    this._cursorPositionPanel = parent.getElementsByClassName('current-position')[0];
    this._currentSizePanel = parent.getElementsByClassName('current-size')[0];
    this._pointer = parent.getElementsByClassName('pointer')[0];
    this._pointer.classList.add(getInputMode());
    this._isMouseDown = false;
    this._isDraging = false;
    this._startCol = 0;
    this._startRow = 0;
    this._endCol = 0;
    this._endRow = 0;
    this._rate = unitWidth;
    this.currentRow = 0;
    this.currentCol = 0;
    this.isSelecting = false;
    this.setSize(initialData.length, initialData[0].length);

    const sensorMenu = new Menu();
    sensorMenu.append(new MenuItem({
      label: '複製',
      click: () => {
        triggerEvent(EventList.COPY, this.getSensorStatus(), EventFeature.onlyTriggerCurrentCanvas);
      },
    }));
    sensorMenu.append(new MenuItem({
      label: '剪下',
      click: () => {
        triggerEvent(EventList.CUT, this.getSensorStatus(), EventFeature.onlyTriggerCurrentCanvas);
      },
    }));
    sensorMenu.append(new MenuItem({
      label: '貼上',
      click: () => {
        triggerEvent(EventList.PASTE, this.getSensorStatus(), EventFeature.onlyTriggerCurrentCanvas);
      },
    }));

    this._sensor.addEventListener('mousedown', (e) => {
      this._isMouseDown = true;
      setTimeout(() => {
        if (this._isMouseDown) {
          this._isDraging = true;
          triggerEvent(EventList.MOUSE_TRIGGERED, {
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            heightRate: this._heightRate(),
            widthRate: this._widthRate(),
          }, EventFeature.onlyTriggerCurrentCanvas);
          this._setSelectorStart(e.offsetX, e.offsetY);
        }
      }, 300); // over 30ms consider as drag
    });

    this._sensor.addEventListener('mousemove', (e) => {
      if (this._isDraging) {
        this._setSelectorEnd(e.offsetX, e.offsetY);
      }
    });


    this._sensor.addEventListener('mouseup', (e) => {
      this._isMouseDown = false;
    });

    this._sensor.addEventListener('click', (e) => {
      setTimeout(() => {
        if (this._isDraging) {
          this._isDraging = false;
        } else {
          this._resetSelect();
          triggerEvent(EventList.MOUSE_TRIGGERED, {
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            heightRate: this._heightRate(),
            widthRate: this._widthRate(),
          }, EventFeature.onlyTriggerCurrentCanvas);
        }
        this.focusInput();
      }, 0);
    });

    this._sensor.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      sensorMenu.popup({window: remote.getCurrentWindow()});
    });

    /* compositionstart,  compositionend for detecting chinese input */
    this.inputLock = false;
    this._input.addEventListener('compositionstart', (e) => {
      this.inputLock = true;
    });

    this._input.addEventListener('compositionend', (e) => {
      this.inputLock = false;
    });

    this._input.addEventListener('input', (e) => {
      setTimeout(() => { // wait for compositionend
        if (!this.inputLock) {
          triggerEvent(EventList.INPUT, {
            word: e.data,
          }, EventFeature.onlyTriggerCurrentCanvas);
          this._input.value = '';
        }
      }, 0);
    });
  }
};
