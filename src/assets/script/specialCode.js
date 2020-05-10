const background = [40, 41, 42, 43, 44, 45, 46, 47];
const bright = [1];
const color = [30, 31, 32, 33, 34, 35, 36, 37];
const init = [0];
const other = [5]; // TODO: support twinkling

export const availableBackground = background;
export const availableBright = bright;
export const availableColor = color;
export const availableColorCode = [].concat(color, background, bright, init, other);
export const availableInit = init;
export const backgroundColorName = ['background-black', 'background-green', 'background-maroon',
  'background-navy', 'background-olive', 'background-purple', 'background-silver', 'background-teal'];
export const colorCodeToName = {
  normal: {
    front: {
      30: 'black',
      31: 'maroon',
      32: 'green',
      33: 'olive',
      34: 'navy',
      35: 'purple',
      36: 'teal',
      37: 'silver',
    },
    brightFront: {
      30: 'gray',
      31: 'red',
      32: 'lime',
      33: 'yellow',
      34: 'blue',
      35: 'fuchsia',
      36: 'aqua',
      37: 'white',
    },
    background: {
      40: 'black',
      41: 'maroon',
      42: 'green',
      43: 'olive',
      44: 'navy',
      45: 'purple',
      46: 'teal',
      47: 'silver',
    },
  },
  anti: {
    front: {
      30: '#FFF',
      31: '#7FFFFF',
      32: '#FF7FFF',
      33: '#7F7FFF',
      34: '#FFFF7F',
      35: '#7FFF7F',
      36: '#FF7F7F',
      37: '#3F3F3F',
    },
    brightFront: {
      30: '#7F7F7F',
      31: '#0FF',
      32: '#F0F',
      33: '#00F',
      34: '#FF0',
      35: '#0F0',
      36: '#F00',
      37: '#000',
    },
    background: {
      40: '#FFF',
      41: '#7FFFFF',
      42: '#FF7FFF',
      43: '#7F7FFF',
      44: '#FFFF7F',
      45: '#7FFF7F',
      46: '#FF7F7F',
      47: '#3F3F3F',
    },
  },
};
export const colorMapCode = {
  normal: {
    front: {
      30: '#000',
      31: '#800000',
      32: '#008000',
      33: '#808000',
      34: '#000080',
      35: '#800080',
      36: '#008080',
      37: '#C0C0C0',
    },
    brightFront: {
      30: '#808080',
      31: '#F00',
      32: '#0F0',
      33: '#FF0',
      34: '#00F',
      35: '#F0F',
      36: '#0FF',
      37: '#FFF',
    },
    background: {
      40: '#000',
      41: '#800000',
      42: '#008000',
      43: '#808000',
      44: '#000080',
      45: '#800080',
      46: '#008080',
      47: '#C0C0C0',
    },
  },
  anti: {
    front: {
      30: '#FFF',
      31: '#7FFFFF',
      32: '#FF7FFF',
      33: '#7F7FFF',
      34: '#FFFF7F',
      35: '#7FFF7F',
      36: '#FF7F7F',
      37: '#3F3F3F',
    },
    brightFront: {
      30: '#7F7F7F',
      31: '#0FF',
      32: '#F0F',
      33: '#00F',
      34: '#FF0',
      35: '#0F0',
      36: '#F00',
      37: '#000',
    },
    background: {
      40: '#FFF',
      41: '#7FFFFF',
      42: '#FF7FFF',
      43: '#7F7FFF',
      44: '#FFFF7F',
      45: '#7FFF7F',
      46: '#FF7F7F',
      47: '#3F3F3F',
    },
  },
};
export const defaultColorInfo = {
  bright: false,
  color: 37,
  background: 40,
};
export const defaultFileWidth = 80;
export const defaultPx = {
  word: '',
  color: 37,
  background: 40,
  right: false,
  bright: false,
};
export const frontColorName = ['aqua', 'black', 'blue', 'fuchsia', 'gray',
  'green', 'lime', 'maroon', 'navy', 'olive', 'purple', 'red', 'silver', 'teal', 'white', 'yellow'];
export const minFileWidth = 80;
export const paintingMode = {
  NORMAL: 'normal',
  ANTI: 'ANTI',
};
export const specialCode = {
  startPatternOfControll: [27, 91],
  ESC: 27,
  endOfControll: 109,
  splitControll: 59,
  splitControllChar: ';',
  breakLine: [13, 10],
  space: 32,
};
export const transCode = {
  bright: 49,
  30: [51, 48],
  31: [51, 49],
  32: [51, 50],
  33: [51, 51],
  34: [51, 52],
  35: [51, 53],
  36: [51, 54],
  37: [51, 55],
  40: [52, 48],
  41: [52, 49],
  42: [52, 50],
  43: [52, 51],
  44: [52, 52],
  45: [52, 53],
  46: [52, 54],
  47: [52, 55],
};
export const unitHeight = 20;
export const unitWidth = 10;
