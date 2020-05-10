import {cloneANSIData} from '../tool/util.js';
const maxRecordLength = 100;
const defaultSensorStatus = {
  isSelecting: false,
  currentRow: 0,
  currentCol: 0,
};

/*
  node of record tree
  {
    isSaved: boolean,
    data: data,
    next: node,
    prev: node,
    diffInfo: {
      from: {
        row,
        col
      },
      to: {
        row,
        col
      },
      newLines: [indexOfNewLines],
      removedLines: [indexOfRemovedLines]
    }
    TODO(or not to do): branch, current tree is always a stick.
  }
*/

export const Record = class Record {
  setSavedPoint() {
    for (const node of this._recordTree) {
      node.isSaved = false;
    }
    this._recordTree[this._currentPosition].isSaved = true;
  }

  redo() {
    if (this._currentPosition < this._recordTree.length - 1) {
      this._currentPosition++;
      return {
        data: cloneANSIData(this._recordTree[this._currentPosition].data),
        isSaved: this._recordTree[this._currentPosition].isSaved,
        sensorStatus: this._recordTree[this._currentPosition].sensorStatus,
        diffInfo: this._recordTree[this._currentPosition].diffInfo,
      };
    } else {
      return null;
    }
  }

  undo() {
    if (this._currentPosition > 0) {
      this._currentPosition--;
      return {
        data: cloneANSIData(this._recordTree[this._currentPosition].data),
        isSaved: this._recordTree[this._currentPosition].isSaved,
        sensorStatus: this._recordTree[this._currentPosition].sensorStatus,
        diffInfo: this._cloneDiffInfo(this._recordTree[this._currentPosition + 1].diffInfo),
      };
    } else {
      return null;
    }
  }

  _cloneDiffInfo(diffInfo) {
    return {
      from: {
        row: diffInfo.from.row,
        col: diffInfo.from.col,
      },
      to: {
        row: diffInfo.to.row,
        col: diffInfo.to.col,
      },
      newLines: diffInfo.newLines ? diffInfo.newLines : [],
      removedLines: diffInfo.removedLines ? diffInfo.removedLines : [],
    };
  }

  writeEdit(data, sensorStatus, diffInfo) {
    this._recordTree.splice(this._currentPosition + 1);
    this._recordTree.push({
      isSaved: false,
      data: cloneANSIData(data),
      sensorStatus: sensorStatus,
      diffInfo: diffInfo,
    });
    this._currentPosition++;
    if (this._recordTree.length > maxRecordLength) {
      this._recordTree.shift();
      this._currentPosition = maxRecordLength - 1;
    }
  }

  constructor(data = null, sensorStatus = defaultSensorStatus) {
    this._recordTree = [{
      isSaved: true,
      data: cloneANSIData(data),
      sensorStatus: sensorStatus,
      diffInfo: null,
    }];
    this._currentPosition = 0;
  };
};
