import {updateRestRow, updateRowInterval} from '../tool/painting.js';
import {unitWidth, defaultFileWidth, paintingMode} from '../../../assets/script/specialCode.js';

export const AnsiView = class AnsiView {
  appendNewLine(width) {
    this._parent.appendChild(this._getNewCanvas(width));
  };

  insertNewLineAfterCurrentRow(row, width) {
    this._parent.insertBefore(this._getNewCanvas(width), this._parent.childNodes[row].nextSibling);
  }

  removeRow(index) {
    const row = this._parent.getElementsByTagName('canvas')[index];
    row.parentNode.removeChild(row);
  }

  setViewOption(option) {
    const unit = parseFloat(option.unit);
    if (unit) {
      this._viewOption.unit = unit;
    }
    this._viewOption.mode = option.mode ? option.mode : this._viewOption.mode;
  }

  setZoomRate(data, rate) {
    this.setViewOption({
      unit: rate,
    });
    this.updateAll(data);
  }

  updateAll(data) {
    const rows = this._parent.getElementsByTagName('canvas');
    const dataLength = data.length;
    if (rows.length != dataLength) {
      while (rows.length < dataLength) {
        this.appendNewLine();
      }
      while (rows.length > dataLength) {
        this.removeRow(rows.length - 1);
      }
    }
    for (let i = 0; i < dataLength; i++) {
      this.updateOneRow(i, data[i]);
    }
  }

  updateOneRow(index, data, start = null, end = null) {
    const canvas = this._parent.getElementsByTagName('canvas')[index];
    setTimeout(() => {
      if (start || start === 0) {
        if (end) {
          updateRowInterval(canvas, data, {
            start: start,
            end: end,
          }, this._viewOption);
        } else {
          updateRestRow(canvas, data, start, this._viewOption);
        }
      } else {
        updateRestRow(canvas, data, 0, this._viewOption);
      }
    }, 5);
  };

  _getNewCanvas(width = defaultFileWidth) {
    const newLine = document.createElement('canvas');
    newLine.width = width * this._viewOption.unit;
    newLine.height = 2 * this._viewOption.unit;
    const ctx = newLine.getContext('2d');
    ctx.fillRect(0, 0, newLine.width, newLine.height);
    return newLine;
  }

  constructor(parent, initialData) {
    this._parent = parent;
    this._viewOption = {
      unit: unitWidth,
      mode: paintingMode.NORMAL,
    };
    this.appendNewLine();
    if (initialData) {
      this.updateAll(initialData);
    }
  };
};
