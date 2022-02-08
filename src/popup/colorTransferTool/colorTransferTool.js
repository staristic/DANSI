import './colorTransferTool.scss';
import {ipcRenderer} from 'electron';
import {ipcEvent} from '../../assets/script/ipc.js';
const focusClassName = 'focus';
const colorData = {
  before: {
    color: 37,
    bright: false,
    background: 40,
    colorSelected: false,
    backgroundSelected: false,
  },
  after: {
    color: 37,
    bright: false,
    background: 40,
    colorSelected: false,
    backgroundSelected: false,
  },
};
const clickEvent = {
  after: 'after',
  before: 'before',
  go: 'go',
};
const frontPalette = 'front-palette';
const backgroundPalette = 'background-palette';

class ColorTransferTool {
  emitTransferRequire() {
    const checkeds = document.querySelectorAll('input');
    for (const checked of checkeds) {
      colorData[checked.dataset.area][checked.dataset.value] = checked.checked;
    }
    if ( (colorData.before.colorSelected || colorData.before.backgroundSelected) &&
        (colorData.after.colorSelected || colorData.after.backgroundSelected)) {
      ipcRenderer.send(ipcEvent.COLOR_TRANSFER, colorData);
    }
  }

  setBackgroundColor(colorInfo, origin) {
    const buttons = document.querySelectorAll(`[data-timming="${colorInfo.timming}"].${backgroundPalette}`);
    for (const button of buttons) {
      button.classList.remove(focusClassName);
    }
    origin.classList.add(focusClassName);
    colorData[colorInfo.timming].background = parseInt(colorInfo.color);
  }

  setColor(colorInfo, origin) {
    const buttons = document.querySelectorAll(`[data-timming="${colorInfo.timming}"].${frontPalette}`);
    for (const button of buttons) {
      button.classList.remove(focusClassName);
    }
    origin.classList.add(focusClassName);
    colorData[colorInfo.timming].color = parseInt(colorInfo.color);
    colorData[colorInfo.timming].bright = !!colorInfo.bright;
  }

  constructor(root) {
    document.addEventListener('click', (e) => {
      const clickInfo = e.target.dataset;
      switch (clickInfo.timming) {
        case clickEvent.before:
        case clickEvent.after:
          if (e.target.classList.contains(frontPalette)) {
            this.setColor(clickInfo, e.target);
          } else if (e.target.classList.contains(backgroundPalette)) {
            this.setBackgroundColor(clickInfo, e.target);
          }
          break;
        case clickEvent.go:
          this.emitTransferRequire();
          break;
        default:
          return;
      }
    });
  }
}

new ColorTransferTool();
