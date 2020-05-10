import {triggerEvent, EventList, EventFeature} from '../tool/events.js';
import {setColor, setBackgroundColor, setBright} from '../tool/global.js';
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
  };
};
