import {getCurrentHash} from './global.js';

const events = {};

export const listenEvents = (eventName, target, triggeredFunctionName) => {
  if (!events[eventName]) {
    events[eventName] = {
      to: [{
        target: target,
        triggeredFunction: triggeredFunctionName,
      }],
    };
  } else {
    events[eventName].to.push({
      target: target,
      triggeredFunction: triggeredFunctionName,
    });
  }
};

export const triggerEvent = (eventName, data, eventFeature) => {
  if (!eventName) {
    return;
  }

  for (const to of events[eventName].to) {
    if (eventFeature === EventFeature.onlyTriggerCurrentCanvas) {
      if (to.target.hash) {
        if (to.target.hash === getCurrentHash()) {
          to.target[to.triggeredFunction](data);
          return;
        }
      } else {
        to.target[to.triggeredFunction](data);
      }
    } else {
      to.target[to.triggeredFunction](data);
    }
  }
};

export const EventList = {
  BACKSPACE: 'BACKSPACE',
  CLOSE_FILE: 'CLOSE_FILE',
  COPY: 'copy',
  COPY_ALL: 'copy-all',
  CUT: 'cut',
  DELETE: 'DELETE',
  DOWN: 'DOWN',
  EDITED: 'EDITED',
  END: 'END',
  ENTER: 'ENTER',
  FILE_SAVED: 'FILE_SAVED',
  FILE_UNSAVED: 'FILE_UNSAVED',
  FOCUS_FILE: 'FOCUS_FILE',
  INPUT: 'INPUT',
  HOME: 'HOME',
  INSERT: 'INSERT',
  LEFT: 'LEFT',
  MOUSE_TRIGGERED: 'MOUSE_TRIGGERED',
  NEW_FILE: 'NEW_FILE',
  OPEN_FILE: 'OPEN_FILE',
  PAGEDOWN: 'PAGEDOWN',
  PAGEUP: 'PAGEUP',
  PASTE: 'paste',
  REDO: 'REDO',
  REQUIRE_CARET_SET: 'REQUIRE_CARET_SET',
  REQUIRE_FOCUS_INPUT: 'REQUIRE_FOCUS_INPUT',
  RIGHT: 'RIGHT',
  SAVE_FILE: 'SAVE_FILE',
  SET_BACKGROUND_COLOR: 'SET_BACKGROUND_COLOR',
  SET_COLOR: 'SET_COLOR',
  SHORTCUT_INPUT: 'SHORTCUT_INPUT',
  SHOW_IMAGE: 'SHOW_IMAGE',
  SIZE_CHANGE: 'SIZE_CHANGE',
  UNDO: 'UNDO',
  UP: 'UP',
  ZOOM: 'ZOOM',
};

export const EventFeature = {
  onlyTriggerCurrentCanvas: 'onlyTriggerCurrentCanvas',
};
