import {isAnscii} from './util.js';
import {colorMapCode, unitWidth, minFileWidth, paintingMode, defaultColorInfo} from '../../../assets/script/specialCode.js';

const defaultConfig = {
  unit: unitWidth,
  fontFamily: 'MingLiU',
  mode: paintingMode.NORMAL,
  minWidth: minFileWidth,
};

const fillBackground = (painting, color = defaultColorInfo.background, row, col, option) => {
  const unitWidth = option.unit;
  const unitHeight = unitWidth * 2;
  painting.fillStyle = colorMapCode[option.mode].background[color];
  painting.fillRect(col * unitWidth, row * unitHeight, unitWidth, unitHeight);
};

const fillWord = (painting, blockInfo, row, col, option) => {
  if (!blockInfo || !blockInfo.word) {
    return;
  }
  const unitWidth = option.unit;
  const unitHeight = unitWidth * 2;
  const wordWidth = isAnscii(blockInfo.word) ? unitWidth : 2 * unitWidth;
  const temp = document.createElement('canvas');
  temp.width = wordWidth;
  temp.height = unitHeight;
  const gt = temp.getContext('2d');
  const colorScope = blockInfo.bright ? 'brightFront': 'front';
  gt.fillStyle = colorMapCode[option.mode][colorScope][blockInfo.color];
  gt.textBaseline = 'middle';
  gt.textAlign = 'left';
  gt.font = `${option.unit * 2}px ${option.fontFamily}`;
  gt.fillText(blockInfo.word, 0, unitHeight / 2);
  const startPoint = blockInfo.right ? wordWidth / 2 : 0;
  painting.drawImage(temp, startPoint, 0, unitWidth, unitHeight,
      col * unitWidth, row * unitHeight, unitWidth, unitHeight);
};

const drawOneBlock = (painting, blockInfo, row, col, option) => {
  fillBackground(painting, blockInfo && blockInfo.background, row, col, option);
  fillWord(painting, blockInfo, row, col, option);
};

const combineOption = (option) => {
  const result = {};
  for (const key in defaultConfig) {
    if (!option.hasOwnProperty(key)) {
      result[key] = defaultConfig[key];
    } else {
      result[key] = option[key];
    }
  }
  return result;
};

export const drawAnsi = (canvas, ansiInfo, option = defaultConfig) =>{
  if (!ansiInfo.length) {
    return;
  }
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0, l = ansiInfo.length; i < l; i++) {
    drawOneBlock(g, ansiInfo[i], 0, i, combineOption(option));
  }
  return;
};

const resize = (canvas, unit, dataWidth) => {
  const newHeight = 2 * unit;
  const newWidth = unit * dataWidth;
  if (canvas.height != newHeight) { // height changing means rate change, need to re-draw
    canvas.height = newHeight;
    canvas.width = newWidth;
    return;
  } else {
    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d');
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    tempContext.drawImage(canvas, 0, 0);
    canvas.width = newWidth;
    canvas.height = newHeight;
    const g = canvas.getContext('2d');
    g.drawImage(tempCanvas, 0, 0);
  }
};

export const updateRowInterval = (canvas, ansiInfo, interval, option = defaultConfig) => {
  if (!ansiInfo.length) {
    return;
  }
  const g = canvas.getContext('2d');
  const config = combineOption(option);
  if (canvas.width < config.unit * (interval.end + 1)) {
    resize(canvas, config.unit, ansiInfo.length);
  }
  for (let i = interval.start, end = Math.min(interval.end, ansiInfo.length - 1); i <= end; i++) {
    drawOneBlock(g, ansiInfo[i], 0, i, config);
  }
  return;
};

export const updateRestRow = (canvas, ansiInfo, start, option = defaultConfig) => {
  if (!ansiInfo.length) {
    return;
  }
  const g = canvas.getContext('2d');
  const config = combineOption(option);
  if (canvas.width != config.unit * ansiInfo.length) {
    resize(canvas, config.unit, ansiInfo.length);
  }
  for (let i = start, l = ansiInfo.length; i < l; i++) {
    drawOneBlock(g, ansiInfo[i], 0, i, config);
  }
  return;
};
