import {CHAR} from '../../../assets/script/charToBIG5Code.js';

export const cloneANSIData = (data) => {
  const result = [];
  for (const row of data) {
    result.push([]);
    for (const col of row) {
      result[result.length - 1].push(clonePx(col));
    }
  }
  return result;
};

export const clonePx = (data) => {
  const result = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      result[key] = data[key];
    }
  }
  return result;
};

export const getFileNameFromFilePath = (path) => {
  if (!path) {
    return '';
  }
  return path.split(/\/|\\/).pop();
};

export const getFileNameWithoutTypeFromFilePath = (path) => {
  if (!path) {
    return '';
  }
  const name = getFileNameFromFilePath(path).split('.');
  name.pop();
  return name.join('');
};

export const getHashCode = (len = 8) => {
  const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const strlen = str.length;
  let result = '';
  for (let i = 0; i < len; i++) {
    result += str[Math.floor(Math.random() * strlen)];
  }
  return result;
};

export const isAnscii = (word) => {
  if (word === undefined) {
    return false;
  }
  const byteCode = word.charCodeAt(0);
  return word === '' || (0 < byteCode && byteCode < 128);
};

export const isBIG5 = (word) => {
  if (word === undefined) {
    return false;
  }
  return !!CHAR[word];
};

export const isSpaceWord = (word) => {
  return word === '' || word === ' ';
};
