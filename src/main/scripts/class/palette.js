import {triggerEvent, EventList, EventFeature, listenEvents} from '../tool/events.js';
import {setColor, setBackgroundColor, setBright, getColor, getBackgroundColor, getBright} from '../tool/global.js';
const classOfFocus = 'focus';
const classOfFront = 'front-palette';
const classOfBackground = 'background-palette';
const clickEvent = {
  setColor: 'color',
  setBackgroundColor: 'background-color',
};

export const Palette = class Palette {
  setBackgroundColor(colorInfo, origin) {
    setBackgroundColor(colorInfo.color);
    const buttons = this._root.getElementsByClassName(classOfBackground);
    for (const button of buttons) {
      button.classList.remove(classOfFocus);
    }
    origin.classList.add(classOfFocus);
    triggerEvent(EventList.SET_BACKGROUND_COLOR, null, EventFeature.onlyTriggerCurrentCanvas);
  }

  setColor(colorInfo, origin) {
    setColor(colorInfo.color);
    setBright(!!colorInfo.bright);
    const buttons = this._root.getElementsByClassName(classOfFront);
    for (const button of buttons) {
      button.classList.remove(classOfFocus);
    }
    origin.classList.add(classOfFocus);
    triggerEvent(EventList.SET_COLOR, null, EventFeature.onlyTriggerCurrentCanvas);
  }

  swapColor() {
    const oldColor = getColor();
    const oldBgColor = getBackgroundColor();
    setColor(oldBgColor % 10 + 30);
    setBackgroundColor(oldColor % 10 + 40);
    this.update();
  }

  update() {
    const color = getColor();
    const bgColor = getBackgroundColor();
    const bright = getBright();
    for (const button of this._root.getElementsByClassName(classOfFront)) {
      button.classList.toggle(classOfFocus, Number(button.dataset.color) === color && Boolean(Number(button.dataset.bright)) === Boolean(bright));
    }
    for (const button of this._root.getElementsByClassName(classOfBackground)) {
      button.classList.toggle(classOfFocus, Number(button.dataset.color) === bgColor);
    }
  }

  constructor(root) {
    this._root = root;
    this._root.addEventListener('click', (e) => {
      const clickInfo = e.target.dataset;
      switch (clickInfo.type) {
        case clickEvent.setColor:
          this.setColor(clickInfo, e.target);
          break;
        case clickEvent.setBackgroundColor:
          this.setBackgroundColor(clickInfo, e.target);
          break;
        default:
          return;
      }
    });

    listenEvents(EventList.SWAP_COLOR, this, 'swapColor');
  }
};

