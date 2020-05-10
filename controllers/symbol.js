const fs = require('fs');
const configFilePath = './symbols_config';
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);

module.exports.saveSymbolConfig = async (symbols) => {
  try {
    const stream = fs.createWriteStream(configFilePath, {flags: 'w'});
    let str = '';
    for (const symbol of symbols.history) {
      str += symbol;
    }
    str += '\n';
    for (const symbol of symbols.private) {
      str += symbol;
    }
    stream.write(str);
    return null;
  } catch (e) {
    return e;
  }
};

module.exports.getSymbolConfig = async () => {
  try {
    const result = await readFileAsync(configFilePath);
    const symbols = {
      history: [],
      private: [],
    };
    const temp = result.toString().split('\n');
    for (const symbol of temp[0]) {
      symbols.history.push(symbol);
    }
    for (const symbol of temp[1]) {
      symbols.private.push(symbol);
    }
    return symbols;
  } catch (e) {
    return null;
  }
};
