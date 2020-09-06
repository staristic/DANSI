import {minFileWidth, defaultPx} from '../../../assets/script/specialCode.js';
import {AnsiView} from './ansiView.js';
import {Record} from './record.js';
import {triggerEvent, EventList, EventFeature} from '../tool/events.js';
import {getColor, getBackgroundColor, getBright, getInputMode, inputModeOptions} from '../tool/global.js';
import {isAnscii, isBIG5, isSpaceWord, cloneANSIData, clonePx} from '../tool/util.js';
const getDataMaxWidth = (data) => {
  let width = 0;
  for (const row of data) {
    const rowLength = row.length;
    width = rowLength > width ? rowLength : width;
  }
  return width;
};
const deleteDirect = {
  delete: 0,
  backspace: 1,
};

export const editType = {
  BACKSPACE: 'backspace',
  BREAKLINE: 'breakLine',
  COLOR: 'color',
  DELETE: 'delete',
  INPUT: 'input',
  PASTE: 'paste',
};

export const AnsiModel = class AnsiModel {
  edit(type, position, data, direct = null) {
    let diffInfo = null;
    let tempDiff1 = null;
    let tempDiff2 = null;
    switch (type) {
      case editType.INPUT:
        if (position.isSelecting) {
          tempDiff1 = this._deleteArea(position.range);
        }
        tempDiff2 = this._inputPx(position, data, direct);
        diffInfo = this._combineTwoDiffArea(tempDiff1, tempDiff2);
        break;
      case editType.PASTE:
        if (position.isSelecting) {
          tempDiff1 = this._deleteArea(position.range);
        }
        tempDiff2 = this._pasteData(position, data);
        diffInfo = this._combineTwoDiffArea(tempDiff1, tempDiff2);
        break;
      case editType.BREAKLINE:
        diffInfo = this._breakLine(position);
        break;
      case editType.DELETE:
        if (position.isSelecting) {
          diffInfo = this._deleteArea(position.range);
        } else {
          diffInfo = this._delete(position, deleteDirect.delete);
        }
        break;
      case editType.BACKSPACE:
        if (position.isSelecting) {
          diffInfo = this._deleteArea(position.range);
        } else {
          diffInfo = this._delete(position, deleteDirect.backspace);
        }
        break;
      case editType.COLOR:
        if (position.isSelecting) {
          diffInfo = this._changeColor(position.range, data);
        }
        break;
    }
    this._record.writeEdit(this._data, position, diffInfo);
    triggerEvent(EventList.EDITED, null, EventFeature.onlyTriggerCurrentCanvas);
  }

  getAllData() {
    return cloneANSIData(this._data);
  }

  getDataByPosition(row, col) {
    if (typeof row != 'number' || typeof col != 'number') { // case of null input
      return null;
    }
    if (row >= this._data.length || col >= this._width || !this._data[row][col]) {
      return defaultPx;
    } else {
      return clonePx(this._data[row][col]);
    }
  }

  getFileHeight() {
    return this._data.length;
  }

  getFileWidth() {
    return this._width;
  }

  setRecordSaved() {
    this._record.setSavedPoint();
  }

  setZoomRate(rate) {
    this._view.setZoomRate(this._data, rate);
  }

  redo() {
    const redoData = this._record.redo();
    if (redoData) {
      this._data = redoData.data;
      this._width = redoData.data[0].length;
      if (redoData.diffInfo) {
        if (redoData.diffInfo.newLines && redoData.diffInfo.newLines.length) {
          for (let i = 0, l = redoData.diffInfo.newLines.length; i < l; i++) {
            this._view.insertNewLineAfterCurrentRow(redoData.diffInfo.newLines[0] - 1);
          }
        } else if (redoData.diffInfo.removedLines && redoData.diffInfo.removedLines.length) {
          for (let i = redoData.diffInfo.removedLines.length - 1; i >= 0; i--) {
            this._view.removeRow(redoData.diffInfo.removedLines[i]);
          }
        }
        for (let i = redoData.diffInfo.from.row; i <= redoData.diffInfo.to.row; i++) {
          if (this._data[i]) {
            this._view.updateOneRow(i, this._data[i], redoData.diffInfo.from.col, redoData.diffInfo.to.col);
          }
        }
      } else {
        this._view.updateAll(redoData.data);
      }
      triggerEvent(EventList.SIZE_CHANGE, null, EventFeature.onlyTriggerCurrentCanvas);
      triggerEvent(EventList.REQUIRE_CARET_SET, {
        row: redoData.sensorStatus.row,
        col: redoData.sensorStatus.col,
      }, EventFeature.onlyTriggerCurrentCanvas);
      return redoData.isSaved;
    } else {
      return null;
    }
  }

  undo() {
    const undoData = this._record.undo();
    if (undoData) {
      this._data = undoData.data;
      this._width = undoData.data[0].length;
      if (undoData.diffInfo) {
        if (undoData.diffInfo.newLines && undoData.diffInfo.newLines.length > 0) {
          for (let i = undoData.diffInfo.newLines.length - 1; i >= 0; i--) {
            this._view.removeRow(undoData.diffInfo.newLines[i]);
          }
        } else if (undoData.diffInfo.removedLines && undoData.diffInfo.removedLines.length > 0) {
          for (let i = 0, l = undoData.diffInfo.removedLines.length; i < l; i++) {
            this._view.insertNewLineAfterCurrentRow(undoData.diffInfo.removedLines[0] - 1);
          }
        }
        for (let i = undoData.diffInfo.from.row; i <= undoData.diffInfo.to.row; i++) {
          if (this._data[i]) {
            this._view.updateOneRow(i, this._data[i], undoData.diffInfo.from.col, undoData.diffInfo.to.col);
          }
        }
      } else {
        this._view.updateAll(undoData.data);
      }
      triggerEvent(EventList.SIZE_CHANGE, null, EventFeature.onlyTriggerCurrentCanvas);
      triggerEvent(EventList.REQUIRE_CARET_SET, {
        row: undoData.sensorStatus.row,
        col: undoData.sensorStatus.col,
      }, EventFeature.onlyTriggerCurrentCanvas);
      return undoData.isSaved;
    } else {
      return null;
    }
  }

  _breakLine(breakPosition) {
    const row = breakPosition.row;
    const nextRow = row + 1;
    const col = breakPosition.col;
    let viewChangeFrom = col;
    if (this._data[row][col] && this._data[row][col].right) {
      this._data[row][col].right = false;
      this._data[row][col].word = '';
      this._data[row][col - 1].word = '';
      viewChangeFrom--;
    }
    this._newRow(row);
    for (let i = col, j = 0, l = this._data[row].length; i < l; i++, j++) {
      this._writeData(this._data[row][i], nextRow, j);
      this._setPxAsDefault(row, i);
    }
    this._fixDataWithNewWidth();
    this._view.updateOneRow(row, this._data[row], viewChangeFrom);
    this._view.updateOneRow(nextRow, this._data[nextRow]);
    triggerEvent(EventList.REQUIRE_CARET_SET, {
      row: nextRow,
      col: 0,
    }, EventFeature.onlyTriggerCurrentCanvas);
    return this._getDiffAreaData(row, 0, nextRow, this._width - 1, [nextRow]);
  }

  _changeColor(range, colorInfo) {
    const isMatch = (condition, data) => {
      for (const key in condition) {
        if (condition[key] != data[key]) {
          return false;
        }
      }
      const word = data.word;
      if (condition.color && isSpaceWord(word)) {
        return false;
      }
      return true;
    };

    const updateColor = (info, row, col) => {
      for (const key in info.target) {
        if (info.target.hasOwnProperty(key)) {
          this._data[row][col][key] = info.target[key];
        }
      }
    };

    for (let row = range.from.row; row <= range.to.row; row++) {
      for (let col = range.from.col; col <= range.to.col; col++) {
        if (colorInfo.condition) {
          if (isMatch(colorInfo.condition, this._data[row][col])) {
            updateColor(colorInfo, row, col);
          }
        } else {
          updateColor(colorInfo, row, col);
        }
      }
      this._view.updateOneRow(row, this._data[row], range.from.col, range.to.col);
    }
    return range;
  }

  _clearBorder(isNewWordAscii, row, col, onlyCheckLeft = false) {
    const resetFromRight = (r, c) => {
      this._data[r][c].word = '';
      this._data[r][c].right = false;
    };

    if (!this._data[row][col]) {
      return;
    }
    if (onlyCheckLeft) {
      if (this._data[row][col].right) {
        resetFromRight(row, col);
        this._data[row][col - 1].word = '';
      }
      return;
    }
    const isCurrentWordAscii = isAnscii(this._data[row][col].word);
    if (isCurrentWordAscii) {
      if (isNewWordAscii) {
        return;
      } else {
        if (this._data[row][col + 1]) {
          if (!isAnscii(this._data[row][col + 1].word)) {
            resetFromRight(row, col + 2);
          }
          this._data[row][col + 1].word = '';
        }
      }
    } else {
      if (isNewWordAscii) {
        if (this._data[row][col].right) {
          this._data[row][col - 1].word = '';
        } else {
          resetFromRight(row, col + 1);
        }
      } else {
        if (this._data[row][col].right) {
          this._data[row][col - 1].word = '';
          if (this._data[row].length - 1 > col) {
            if (!isAnscii(this._data[row][col + 1].word)) {
              resetFromRight(row, col + 2);
            }
            this._data[row][col + 1].word = '';
          }
        } else {
          resetFromRight(row, col + 1);
        }
      }
    }
  };

  _combineTwoDiffArea(diff1 = null, diff2 = null) {
    if (diff1 === null || diff2 === null) {
      return diff1 === null ? diff2 : diff1;
    }
    return {
      from: {
        row: diff1.from.row <= diff2.from.row ? diff1.from.row : diff2.from.row,
        col: diff1.from.col <= diff2.from.col ? diff1.from.col : diff2.from.col,
      },
      to: {
        row: diff1.to.row >= diff2.to.row ? diff1.to.row : diff2.to.row,
        col: diff1.to.col >= diff2.to.col ? diff1.to.col : diff2.to.col,
      },
      newLines: diff1.newLines ? diff1.newLines : diff2.newLines,
      // There are always one newLines in diff1 or diff2
    };
  }

  _delete(position, direct) {
    const row = position.row; const col = position.col;
    if (row < 0) {
      return null;
    }
    const inputMode = getInputMode();
    if (direct === deleteDirect.delete && this._isCurrentPxLast(row, col)) {
      this._mergeLine(row);
      return this._getDiffAreaData(row, 0, row + 1, this._width - 1, [], [row + 1]);
    } else if (direct === deleteDirect.backspace && col === 0) {
      if (row - 1 >= 0) {
        this._mergeLine(row - 1);
        return this._getDiffAreaData(row - 1, 0, row, this._width - 1, [], [row]);
      } else {
        return this._getDiffAreaData(0, 0, 0, 0);
      }
    }
    if (inputMode === inputModeOptions.OVERWRITE) {
      this._clearBorder(true, row, col - direct);
      this._setPxAsDefault(row, col - direct);
      this._view.updateOneRow(row, this._data[row]);
      triggerEvent(EventList.REQUIRE_CARET_SET, {
        row: row,
        col: col - ( 2 * direct - 1),
      }, EventFeature.onlyTriggerCurrentCanvas);
    } else if (inputMode === inputModeOptions.INSERT) {
      this._clearBorder(true, row, col - direct);
      this._data[row].splice(col - direct, 1);
      this._pushDefaultPxToRow(row);
      this._view.updateOneRow(row, this._data[row]);
      if (direct === deleteDirect.backspace) {
        triggerEvent(EventList.REQUIRE_CARET_SET, {
          row: row,
          col: col - direct,
        }, EventFeature.onlyTriggerCurrentCanvas);
      }
    }
    this._fixDataWithNewWidth();
    return this._getDiffAreaData(row, Math.max(0, col - 2), row, Math.min(this._width - 1, col + 2));
  }

  _deleteArea(range) {
    for (let i = range.from.row; i <= range.to.row; i++) {
      this._clearBorder(true, i, range.from.col);
      this._clearBorder(true, i, range.to.col);
      for (let j = range.from.col; j <= range.to.col; j++) {
        this._setPxAsDefault(i, j);
      }
      this._view.updateOneRow(i, this._data[i]);
    }
    triggerEvent(EventList.REQUIRE_CARET_SET, {
      row: range.from.row,
      col: range.from.col,
    }, EventFeature.onlyTriggerCurrentCanvas);
    return range;
  }

  _findRowRealWidth(rowIndex) {
    for (let i = this._data[rowIndex].length - 1; i >= 0; i--) {
      if (this._data[rowIndex][i].word != defaultPx.word ||
         this._data[rowIndex][i].color != defaultPx.color ||
         this._data[rowIndex][i].background != defaultPx.background ||
         this._data[rowIndex][i].right != defaultPx.right ||
         this._data[rowIndex][i].bright != defaultPx.bright
      ) {
        return i + 1;
      }
    }
    return 0;
  }

  _fixDataWithNewWidth(newWidth = null) { // auto fix current size
    const findRealWidth = () => {
      let maxLengthIndex = 0;
      for (let i = 0, l = this._data.length; i < l; i++) {
        const temp = this._findRowRealWidth(i);
        maxLengthIndex = temp > maxLengthIndex ? temp : maxLengthIndex;
      }
      return maxLengthIndex;
    };
    const realWidth = newWidth || Math.max(minFileWidth, findRealWidth());
    if (realWidth === this._width) {
      triggerEvent(EventList.SIZE_CHANGE, null, EventFeature.onlyTriggerCurrentCanvas);
      return;
    }
    for (let i = 0, l = this._data.length; i < l; i++) {
      if (this._data[i].length < realWidth) {
        while (this._data[i].length < realWidth) {
          this._pushDefaultPxToRow(i);
        }
      } else {
        this._data[i].splice(realWidth, this._data[i].length);
      }
    }
    this._width = realWidth;
    triggerEvent(EventList.SIZE_CHANGE, null, EventFeature.onlyTriggerCurrentCanvas);
  }

  _getDiffAreaData(fromRow, fromCol, toRow, toCol, newLines, removedLines) {
    return {
      from: {
        row: fromRow,
        col: fromCol,
      },
      to: {
        row: toRow,
        col: toCol,
      },
      newLines: newLines ? newLines : [],
      removedLines: removedLines ? removedLines : [],
    };
  }

  _inputPx(position, str, afterInputDirect = null) {
    const inputMode = getInputMode();
    const row = position.row; const col = position.col;
    const tempData = this._inputStringToANSIData(str);
    const newDataWidth = tempData.length;
    const updateFrom = Math.max(0, col - 1);
    let updateEnd = null;
    if (inputMode === inputModeOptions.INSERT) {
      this._clearBorder(false, row, col, true);
      for (let i = 0; i < newDataWidth; i++) {
        if (this._isCurrentPxLast(row, this._data[row].length - 1)) {
          this._data[row].pop();
        }
      }
      this._data[row].splice(col, 0, ...tempData);
      while (this._data[row].length < this._width) {
        this._pushDefaultPxToRow(row);
      }
    } else if (inputMode === inputModeOptions.OVERWRITE) {
      updateEnd = updateFrom + newDataWidth + 1;
      this._clearBorder(isAnscii(tempData[0].word), row, col);
      if (this._data[row].length > col + newDataWidth - 1) {
        this._clearBorder(isAnscii(tempData[newDataWidth - 1].word) || tempData[newDataWidth - 1].right, row, col + newDataWidth - 1);
      }
      for (let i = 0; i < newDataWidth; i++) {
        this._writeData(tempData[i], row, col + i);
      }
    }
    this._fixDataWithNewWidth(this._data[row].length);
    this._view.updateOneRow(row, this._data[row], updateFrom, updateEnd);
    if (afterInputDirect) {
      triggerEvent(EventList.REQUIRE_CARET_SET, {
        row: Math.max(Math.min(row + afterInputDirect.rowDiff, this._data.length - 1), 0),
        col: Math.max(Math.min(col + afterInputDirect.colDiff, this._width - 1), 0),
      }, EventFeature.onlyTriggerCurrentCanvas);
    } else {
      triggerEvent(EventList.REQUIRE_CARET_SET, {
        row: row,
        col: col + newDataWidth,
      }, EventFeature.onlyTriggerCurrentCanvas);
    }
    return this._getDiffAreaData(row, updateFrom, row, updateEnd);
  }

  _inputStringToANSIData(str) {
    const data = [];
    const generatedata = (word, costSpace) => {
      for (let i = costSpace; i > 0; i--) {
        data.push({
          word: word,
          color: getColor(),
          background: getBackgroundColor(),
          right: !(i === costSpace),
          bright: getBright(),
        });
      }
    };
    for (let word of str) {
      const costSpace = isAnscii(word) ? 1 : 2;
      word = costSpace === 1 || isBIG5(word) ? word : ' ';
      generatedata(word, costSpace);
    }
    return data;
  }

  _isCurrentPxLast(row, col) {
    for (let i = col, l = this._data[row].length; i < l; i++) {
      if (this._data[row][i].word != defaultPx.word ||
         this._data[row][i].color != defaultPx.color ||
         this._data[row][i].background != defaultPx.background ||
         this._data[row][i].right != defaultPx.right ||
         this._data[row][i].bright != defaultPx.bright
      ) {
        return false;
      }
    }
    return true;
  }

  _mergeLine(row, col) { // merge current and next row. if col, forced merge at col.
    if (!this._data[row] || !this._data[row + 1]) {
      return;
    }
    const tail = col ? col : this._findRowRealWidth(row);
    for (let i = tail, j = 0, nextTail = this._findRowRealWidth(row + 1); j < nextTail; i++, j++) {
      this._writeData(this._data[row + 1][j], row, i);
    }
    this._data.splice(row + 1, 1);
    this._view.removeRow(row + 1);
    this._fixDataWithNewWidth();
    this._view.updateOneRow(row, this._data[row]);
    triggerEvent(EventList.REQUIRE_CARET_SET, {
      row: row,
      col: tail,
    }, EventFeature.onlyTriggerCurrentCanvas);
  }

  _newRow(row) { // new row at next line
    const nextRow = row + 1;
    this._data.splice(nextRow, 0, []);
    for (let i = 0; i < this._width; i++) {
      this._pushDefaultPxToRow(nextRow);
    }
    this._view.insertNewLineAfterCurrentRow(row);
    triggerEvent(EventList.SIZE_CHANGE, null, EventFeature.onlyTriggerCurrentCanvas);
  };

  _pasteData(position, data) {
    const dataLength = getDataMaxWidth(data);
    if (position.col + dataLength > this._width) {
      this._fixDataWithNewWidth(position.col + dataLength);
    }
    const newLines = [];
    for (let i = 0, row = position.row, l = data.length; i < l; i++, row++) {
      if (row === this._data.length) {
        newLines.push(row);
        this._newRow(row - 1);
      }
      let rowLength = data[i].length;
      this._clearBorder(isAnscii(data[i][0].word), row, position.col);
      this._clearBorder(isAnscii(data[i][rowLength - 1].word), row, position.col + rowLength - 1);
      for (let j = 0, col = position.col; j < rowLength && j < this._width; j++, col++) {
        this._writeData(data[i][j], row, col);
      }
      this._view.updateOneRow(row, this._data[row], position.col - 1, position.col + rowLength + 1);
      triggerEvent(EventList.REQUIRE_CARET_SET, {
        row: position.row,
        col: position.col,
      }, EventFeature.onlyTriggerCurrentCanvas);
    }
    return this._getDiffAreaData(position.row, Math.max(position.col - 1, 0), position.row + data.length - 1, position.col + dataLength, newLines);
  }

  _pushDefaultPxToRow(row) {
    this._data[row].push({
      word: '',
      color: 37,
      background: 40,
      right: false,
      bright: false,
    });
  }

  _setPxAsDefault(row, col) {
    this._data[row][col] = {
      word: '',
      color: 37,
      background: 40,
      right: false,
      bright: false,
    };
  }

  _writeData(data, row, col) {
    if (!this._data[row][col]) {
      this._data[row][col] = {};
    }
    for (const key in defaultPx) {
      if (key === 'color' || key === 'background') {
        this._data[row][col][key] =
          data.hasOwnProperty(key) ? parseInt(data[key]) : defaultPx[key];
      } else {
        this._data[row][col][key] =
          data.hasOwnProperty(key) ? data[key] : defaultPx[key];
      }
    }
    const word = data.word;
    if (isSpaceWord(word)) {
      this._data[row][col].color = defaultPx.color;
      this._data[row][col].bright = defaultPx.bright;
    }
  };

  constructor(canvas, data) {
    /*
      this._data = [][]
      entry in json =
      {
        word: only one char
        color: color hex
        background: backgroun color hex
        right: align right or not
        bright: bright or not
      }
    */
    if (data) {
      this._data = data;
      for (let row = 0, l = this._data.length; row < l; row++) {
        while (this._data[row].length < minFileWidth) {
          this._pushDefaultPxToRow(row);
        }
      }
    } else {
      this._data = [[]];
      for (let i = 0; i < minFileWidth; i++) {
        this._pushDefaultPxToRow(0);
      }
    }
    this._width = getDataMaxWidth(this._data);
    this._record = new Record(this._data);
    this._view = new AnsiView(canvas, this._data);
  };
};
