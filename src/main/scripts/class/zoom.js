import {triggerEvent, EventList, EventFeature} from '../tool/events.js';
const defaultZoomRate = 100;

export const Zoom = class Zoom {
  _setZoomRate(value) {
    this._zoomRate = parseInt(value);
    this._panel.getElementsByTagName('b')[0].innerHTML = this._zoomRate;
    triggerEvent(EventList.ZOOM, this._zoomRate / 10, EventFeature.onlyTriggerCurrentCanvas);
  }

  constructor(panel) {
    this._panel = panel;
    this._zoomRate = defaultZoomRate;

    this._panel.addEventListener('input', (e) => {
      this._setZoomRate(e.target.value);
    });
  };
};
