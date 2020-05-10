export const shortcut = [
  {
    verticle: ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'],
    horizen: ['▏', '▎', '▍', '▌', '▋', '▊', '▉'],
    rightUp: '◥',
    rightDown: '◢',
    leftDown: '◣',
    leftUp: '◤',
  },
  [
    ['┌', '┬', '┐'],
    ['├', '┼', '┤'],
    ['└', '┴', '┘'],
    ['─', '│'],
  ],
  [
    ['╓', '╥', '╖'],
    ['╟', '╫', '╢'],
    ['╙', '╨', '╜'],
    ['─', '║'],
  ],
  [
    ['╒', '╤', '╕'],
    ['╞', '╪', '╡'],
    ['╘', '╧', '╛'],
    ['═', '│'],
  ],
  [
    ['╔', '╦', '╗'],
    ['╠', '╬', '╣'],
    ['╚', '╩', '╝'],
    ['═', '║'],
  ],
  [
    ['╭', '┬', '╮'],
    ['├', '┼', '┤'],
    ['╰', '┴', '╯'],
    ['─', '│'],
  ],
];

const direct = {
  rightUp: 'rightUp',
  rightDown: 'rightDown',
  leftDown: 'leftDown',
  leftUp: 'leftUp',
  left: 'left',
  up: 'up',
  right: 'right',
  down: 'down',
};

export const keycodeDirect = {
  33: direct.rightUp,
  34: direct.rightDown,
  35: direct.leftDown,
  36: direct.leftUp,
  37: direct.left,
  38: direct.up,
  39: direct.right,
  40: direct.down,
};

export const getShortcutWord = (index, neighbor, dir) => {
  const collection = shortcut[index];
  if (index === 0) {
    if (dir === direct.up) {
      const wordIndex = collection.verticle.indexOf(neighbor.self);
      return collection.verticle[Math.min(wordIndex + 1, collection.verticle.length - 1)];
    } else if (dir === direct.down) {
      const wordIndex = collection.verticle.indexOf(neighbor.self);
      if (wordIndex === -1) {
        return collection.verticle[collection.verticle.length - 1];
      } else {
        return collection.verticle[Math.max(wordIndex - 1, 0)];
      }
    } else if (dir === direct.left) {
      const wordIndex = collection.horizen.indexOf(neighbor.self);
      if (wordIndex === -1) {
        return collection.horizen[collection.horizen.length - 1];
      } else {
        return collection.horizen[Math.max(wordIndex - 1, 0)];
      }
    } else if (dir === direct.right) {
      const wordIndex = collection.horizen.indexOf(neighbor.self);
      return collection.horizen[Math.min(wordIndex + 1, collection.horizen.length - 1)];
    } else {
      return collection[dir];
    }
  } else {
    const isUpMatch = neighbor.up === collection[0][0] || neighbor.up === collection[0][1] ||
                   neighbor.up === collection[0][2] || neighbor.up === collection[3][1] ||
                   neighbor.up === collection[1][0] || neighbor.up === collection[1][1] ||
                   neighbor.up === collection[1][2];
    const isRightMatch = neighbor.right === collection[0][2] || neighbor.right === collection[1][2] ||
                      neighbor.right === collection[2][2] || neighbor.right === collection[3][0] ||
                      neighbor.right === collection[0][1] || neighbor.right === collection[1][1] ||
                      neighbor.right === collection[2][1];
    const isLeftMatch = neighbor.left === collection[0][0] || neighbor.left === collection[1][0] ||
                     neighbor.left === collection[2][0] || neighbor.left === collection[3][0] ||
                     neighbor.left === collection[0][1] || neighbor.left === collection[1][1] ||
                     neighbor.left === collection[2][1];
    const isDownMatch = neighbor.down === collection[2][0] || neighbor.down === collection[2][1] ||
                     neighbor.down === collection[2][2] || neighbor.down === collection[3][1] ||
                     neighbor.down === collection[1][0] || neighbor.down === collection[1][1] ||
                     neighbor.down === collection[1][2];

    if (dir === direct.up) {
      if (isRightMatch && isLeftMatch && isDownMatch) {
        return collection[1][1];
      } else if (!isRightMatch && isLeftMatch && isDownMatch) {
        return collection[1][2];
      } else if (isRightMatch && !isLeftMatch && isDownMatch) {
        return collection[1][0];
      } else if (isRightMatch && isLeftMatch && !isDownMatch) {
        return collection[2][1];
      } else if (!isRightMatch && !isLeftMatch && isDownMatch) {
        return collection[3][1];
      } else if (!isRightMatch && isLeftMatch && !isDownMatch) {
        return collection[2][2];
      } else if (isRightMatch && !isLeftMatch && !isDownMatch) {
        return collection[2][0];
      } else {
        return collection[3][1];
      }
    } else if (dir === direct.down) {
      if (isRightMatch && isLeftMatch && isUpMatch) {
        return collection[1][1];
      } else if (!isRightMatch && isLeftMatch && isUpMatch) {
        return collection[1][2];
      } else if (isRightMatch && !isLeftMatch && isUpMatch) {
        return collection[1][0];
      } else if (isRightMatch && isLeftMatch && !isUpMatch) {
        return collection[0][1];
      } else if (!isRightMatch && !isLeftMatch && isUpMatch) {
        return collection[3][1];
      } else if (!isRightMatch && isLeftMatch && !isUpMatch) {
        return collection[0][2];
      } else if (isRightMatch && !isLeftMatch && !isUpMatch) {
        return collection[0][0];
      } else {
        return collection[3][1];
      }
    } else if (dir === direct.left) {
      if (isRightMatch && isUpMatch && isDownMatch) {
        return collection[1][1];
      } else if (!isRightMatch && isUpMatch && isDownMatch) {
        return collection[1][2];
      } else if (isRightMatch && !isUpMatch && isDownMatch) {
        return collection[0][1];
      } else if (isRightMatch && isUpMatch && !isDownMatch) {
        return collection[2][1];
      } else if (!isRightMatch && !isUpMatch && isDownMatch) {
        return collection[0][2];
      } else if (!isRightMatch && isUpMatch && !isDownMatch) {
        return collection[2][2];
      } else if (isRightMatch && !isUpMatch && !isDownMatch) {
        return collection[3][0];
      } else {
        return collection[3][0];
      }
    } else if (dir === direct.right) {
      if (isUpMatch && isLeftMatch && isDownMatch) {
        return collection[1][1];
      } else if (!isUpMatch && isLeftMatch && isDownMatch) {
        return collection[0][1];
      } else if (isUpMatch && !isLeftMatch && isDownMatch) {
        return collection[1][0];
      } else if (isUpMatch && isLeftMatch && !isDownMatch) {
        return collection[2][1];
      } else if (!isUpMatch && !isLeftMatch && isDownMatch) {
        return collection[0][0];
      } else if (!isUpMatch && isLeftMatch && !isDownMatch) {
        return collection[3][0];
      } else if (isUpMatch && !isLeftMatch && !isDownMatch) {
        return collection[2][0];
      } else {
        return collection[3][0];
      }
    }
  }
  return null;
};
