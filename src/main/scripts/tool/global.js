import {ipcEvent} from '../../../assets/script/ipc.js';
import {ipcRenderer} from 'electron';

export const inputModeOptions = {
  OVERWRITE: 'overwrite',
  INSERT: 'insert',
};

const globalStatus = {
  currentHash: '',
  color: 37,
  backgroundColor: 40,
  bright: false,
  inputMode: inputModeOptions.OVERWRITE,
  shortcutMode: 0,
};

const sendColorInfo = () => {
  ipcRenderer.send(ipcEvent.SET_GLOBAL_COLOR, {
    color: globalStatus.color,
    backgroundColor: globalStatus.backgroundColor,
    bright: globalStatus.bright,
  });
};

export const getBackgroundColor = () => {
  return globalStatus.backgroundColor;
};

export const getBright = () => {
  return globalStatus.bright;
};

export const getColor = () => {
  return globalStatus.color;
};

export const getCurrentHash = () => {
  return globalStatus.currentHash;
};

export const getInputMode = () => {
  return globalStatus.inputMode;
};

export const getShortcutMode = () => {
  return globalStatus.shortcutMode;
};

export const setBackgroundColor = (backgroundColor = globalStatus.backgroundColor) => {
  globalStatus.backgroundColor = parseInt(backgroundColor);
  sendColorInfo();
};

export const setBright = (bright = globalStatus.bright) => {
  globalStatus.bright = bright;
  sendColorInfo();
};

export const setColor = (color = globalStatus.color) => {
  globalStatus.color = parseInt(color);
  sendColorInfo();
};

export const setCurrentHash = (hash) => {
  globalStatus.currentHash = hash;
};

export const setInputMode = (mode) => {
  globalStatus.inputMode = mode;
};

export const setShortcutMode = (mode = 0) => {
  globalStatus.shortcutMode = parseInt(mode);
};

export const toggleInputMode = (mode) => {
  globalStatus.inputMode = globalStatus.inputMode === 'overwrite' ? 'insert' : 'overwrite';
};
