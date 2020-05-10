import {BIG5} from '../../../assets/script/BIG5CodeToChar.js';
import {CHAR} from '../../../assets/script/charToBIG5Code.js';
import {specialCode, transCode, availableColor, availableBackground, availableBright, availableInit, availableColorCode, defaultColorInfo} from '../../../assets/script/specialCode.js';
import {isAnscii, isSpaceWord} from './util.js';

const isBreakLine = (buffer, index) => {
  for (let i = 0, l = specialCode.breakLine.length; i < l; i++) {
    if (buffer[index + i] != specialCode.breakLine[i]) {
      return false;
    }
  }
  return true;
};

const isControllCode = (buffer, index) => {
  for (let i = 0, l = specialCode.startPatternOfControll.length; i < l; i++) {
    if (buffer[index + i] != specialCode.startPatternOfControll[i]) {
      return false;
    }
  }
  return true;
};

const parseControllCode = (buffer) => {
  const codeList = buffer.toString().split(specialCode.splitControllChar);
  if (!codeList || !codeList.length) {
    return [availableInit[0]];
  }
  const result = [];
  for (let i = 0, l = codeList.length; i < l; i++) {
    if (codeList[i]) {
      codeList[i] = result.push(parseInt(codeList[i]));
    } else {
      result.push(availableInit[0]);
    }
  }
  if (!result.every( (e) => availableColorCode.includes(e))) {
    throw new Error('Invalid Controll Code');
  }
  return result;
};

const isAsciiVisibleCode = (code) => {
  return code >= 32 && code <= 126;
};

export const ansiFileToJson = (binary) => {
  /*
    json = [][]
    entry in json =
    {
      word: only one char
      color: color hex
      background: backgroun color hex
      right: align right or not
      bright: bright or not
    }
  */
  const buffer = new Uint8Array(binary);
  let rowCount = 0;
  const size = buffer.length;
  const result = [[]];
  let currentColor = defaultColorInfo.color;
  let currentBackground = defaultColorInfo.background;
  let bright = defaultColorInfo.bright;

  const addElement = (word, right) => {
    result[rowCount].push({
      word: word,
      color: currentColor,
      background: currentBackground,
      bright: bright,
      right: right,
    });
  };

  const setColor = (colorInfo) => {
    if (!colorInfo.length) {
      currentColor = defaultColorInfo.color;
      currentBackground = defaultColorInfo.background;
      return;
    }
    colorInfo.forEach((e) => {
      if (availableInit.includes(e)) {
        currentColor = defaultColorInfo.color;
        currentBackground = defaultColorInfo.background;
        bright = defaultColorInfo.bright;
      } else if (availableBright.includes(e)) {
        bright = true;
      } else if (availableColor.includes(e)) {
        currentColor = e;
      } else if (availableBackground.includes(e)) {
        currentBackground = e;
      }
    });
  };

  const big5BinaryCodeToChar = (i, j) => {
    const word = BIG5[(buffer[i].toString(16) + buffer[j].toString(16)).toUpperCase()];
    return word ? word : '';
  };

  const secondBytePositionOfCurrentPosition = (i) => {
    let temp = i + 1;
    while (buffer[temp] != 109 && temp < size) {
      temp++;
    }
    return temp + 1;
  };

  const controllCodeBuffer = (i) => {
    let j = i + 2;
    const controllBuffer = [];
    while (j < size && buffer[j] != specialCode.endOfControll) {
      controllBuffer.push(buffer[j]);
      j++;
    }
    return controllBuffer;
  };

  const getDataMaxWidth = (data) => {
    let width = 0;
    for (const row of data) {
      const rowLength = row.length;
      width = rowLength > width ? rowLength : width;
    }
    return width;
  };

  for (let i = 0; i < size; i++) {
    if (isBreakLine(buffer, i)) { // break line
      rowCount++;
      i++;
      result.push([]);
      continue;
    } else if (isControllCode(buffer, i)) { // controll code
      setColor(parseControllCode(new Buffer(controllCodeBuffer(i))));
      while (i < size) {
        if (buffer[i] === specialCode.endOfControll) {
          break;
        }
        i++;
      }
    } else if (isAsciiVisibleCode(buffer[i])) { // ascii char
      addElement(String.fromCharCode(buffer[i]), false);
    } else { // all other case is big5 char
      let big5Char;
      if (isControllCode(buffer, i + 1)) { // two color case
        const nextPosition = secondBytePositionOfCurrentPosition(i);
        big5Char = big5BinaryCodeToChar(i, nextPosition);
        addElement(big5Char, false);
        setColor(parseControllCode(new Buffer(controllCodeBuffer(i + 1))));
        addElement(big5Char, true);
        i = nextPosition;
      } else { // single color case
        big5Char = big5BinaryCodeToChar(i, i+ 1);
        addElement(big5Char, false);
        addElement(big5Char, true);
        i++;
      }
    }
  }
  const finalWidth = getDataMaxWidth(result);
  for (const row of result) {
    while (row.length < finalWidth) {
      row.push({
        word: '',
        color: 37,
        background: 40,
        right: false,
        bright: false,
      });
    }
  }
  return result;
};

export const jsonToANSI = (data) => {
  /*
    data = [[ansi px]]
    px = {
      word: word,
      color: currentColor,
      background: currentBackground,
      bright: bright,
      right: right
    }
    return number of Array
  */

  const result = [];
  let currentColor; let currentBackground; let currentBright;

  const initialCurrentInfo = () => {
    currentColor = defaultColorInfo.color;
    currentBackground = defaultColorInfo.background;
    currentBright = defaultColorInfo.bright;
  };

  const pushColor = (info) => {
    const pushColorCode = (color) => {
      for (const c of transCode[color]) {
        result.push(c);
      }
    };

    if (info.color === currentColor &&
       info.background === currentBackground &&
       info.bright === currentBright) {
      return;
    }
    for (const code of specialCode.startPatternOfControll) { // start controll code
      result.push(code);
    }
    if (info.bright != currentBright) {
      if (info.bright) { // dark to bright
        result.push(transCode.bright);
        if (info.color != currentColor) {
          result.push(specialCode.splitControll);
          pushColorCode(info.color);
        }
        if (info.background != currentBackground) {
          result.push(specialCode.splitControll);
          pushColorCode(info.background);
        }
      } else { // bright to dark
        result.push(specialCode.splitControll);
        if (info.color != defaultColorInfo.color) {
          result.push(specialCode.splitControll);
          pushColorCode(info.color);
        }
        if (info.background != defaultColorInfo.background) {
          result.push(specialCode.splitControll);
          pushColorCode(info.background);
        }
      }
    } else { // keep same bright
      if (info.color != currentColor) {
        pushColorCode(info.color);
        if (info.background != currentBackground) {
          result.push(specialCode.splitControll);
        }
      }
      if (info.background != currentBackground) {
        pushColorCode(info.background);
      }
    }
    result.push(specialCode.endOfControll); // end controll code
    currentColor = info.color;
    currentBackground = info.background;
    currentBright = info.bright;
  };

  const pushWord = (info) => {
    if (isSpaceWord(info.word)) {
      result.push(specialCode.space);
      return;
    }
    if (isAnscii(info.word)) {
      result.push(info.word.charCodeAt(0));
    } else {
      const BIG5Code = CHAR[info.word];
      if (BIG5Code) {
        if (info.right) {
          result.push(parseInt(BIG5Code.substring(2, 4), 16) - 256);
        } else {
          result.push(parseInt(BIG5Code.substring(0, 2), 16) - 256);
        }
      } else {
        result.push(specialCode.space);
      }
    }
  };

  const pushBreakLineCode = () => {
    for (let s = 0, l = specialCode.breakLine.length; s < l; s++) {
      result.push(specialCode.breakLine[s]);
    }
  };

  for (let i = 0, line = data.length; i < line; i++) {
    initialCurrentInfo();
    if (data[i][0].right) { // avoid broken BIG5
      data[i][0].right = false;
      data[i][0].word = '';
    }
    const width = data[i].length;
    const lastIndex = width - 1;
    if (!data[i][lastIndex].right && !isAnscii(data[i][lastIndex].word)) { // avoid broken BIG5
      data[i][lastIndex].word = '';
    }
    for (let j = 0; j < width; j++) {
      const word = data[i][j].word;
      if (isSpaceWord(word)) {
        data[i][j].bright = defaultColorInfo.bright;
        data[i][j].color = defaultColorInfo.color;
      }
      pushColor(data[i][j]);
      pushWord(data[i][j]);
    }
    if (data[i][lastIndex].color != defaultColorInfo.color ||
       data[i][lastIndex].background != defaultColorInfo.background ||
       data[i][lastIndex].bright != defaultColorInfo.bright) {
      for (let s = 0, l = specialCode.startPatternOfControll.length; s < l; s++) {
        result.push(specialCode.startPatternOfControll[s]);
      }
      result.push(specialCode.endOfControll);
    }
    if (i < line - 1) {
      pushBreakLineCode();
    }
  }
  return result;
};
