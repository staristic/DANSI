import './symbolInputTool.scss';
import {ipcRenderer} from 'electron';
import {backgroundColorName, frontColorName, colorCodeToName} from '../../assets/script/specialCode.js';
import {ipcEvent} from '../../assets/script/ipc.js';
import {keyboard} from '../../assets/script/keyboard.js';
const maxHistoryLength = 100;
const noticeType = {
  existed: 'existed',
  success: 'success',
};
const panel = {
  history: 'history',
  private: 'private',
  special: 'special',
};
const classOfFocus = 'focus';
const classOfHidden = 'hidden';
const classOfPlus = 'plus-mode';
const classOfRemove = 'remove-mode';
const classOfToggle = 'toggle';
const clickEvents = {
  plus: 'plus',
  remove: 'remove',
  symbol: 'symbol',
  toggle: 'toggle',
};

const SymbolPanel = class SymbolPanel {
  addPrivateSymbol(symbol) {
    if (this._specialSymbol.private.includes(symbol)) {
      this._showNotice(noticeType.existed, symbol);
    } else {
      this._specialSymbol.private.push(symbol);
      this._getPanel(panel.private).insertAdjacentHTML('beforeend', this._getSymbolButton(symbol, panel.private));
      this._showNotice(noticeType.success, symbol);
      this._saveSymbolSetting();
    }
  }

  removePrivateSymbol(symbol) {
    const symbolIndex = this._specialSymbol.private.indexOf(symbol);
    if (symbolIndex >= 0) {
      const button = this._root.querySelectorAll(`#symbol-area [data-name='private'] button[data-symbol="${symbol}"]`)[0];
      this._getPanel(panel.private).removeChild(button);
      this._specialSymbol.private.splice(symbolIndex, 1);
      this._saveSymbolSetting();
    }
  }

  setBrickColor(colorInfo) {
    const bricks = this._root.querySelectorAll(`#symbol-area [data-name='fill'] button`);
    const bright = colorInfo.bright;
    const color = colorInfo.color;
    const backgroundColor = colorInfo.backgroundColor;
    for (const brick of bricks) {
      brick.classList.remove(...frontColorName);
      if (bright) {
        brick.classList.add(
            `${colorCodeToName.normal.brightFront[color]}`);
      } else {
        brick.classList.add(
            `${colorCodeToName.normal.front[color]}`);
      }
      brick.classList.remove(...backgroundColorName);
      brick.classList.add(`background-${colorCodeToName.normal.background[backgroundColor]}`);
    }
  }

  togglePlusMode() {
    this.isPlusMode = !this.isPlusMode;
    const toggleEles = document.getElementsByClassName(classOfToggle);
    if (this.isPlusMode) {
      for (const ele of toggleEles) {
        if (ele.dataset.name != panel.private) {
          ele.classList.add(classOfPlus);
        }
      }
    } else {
      for (const ele of toggleEles) {
        ele.classList.remove(classOfPlus);
      }
    }
  }

  toggleRemoveMode() {
    this.isRemoveMode = !this.isRemoveMode;
    const privatePanel = this._getPanel(panel.private);
    if (this.isRemoveMode) {
      privatePanel.classList.add(classOfRemove);
    } else {
      privatePanel.classList.remove(classOfRemove);
    }
  }

  toggleSymbolDisplay(name) {
    this.currentPanel = name;
    const toggleEles = document.getElementsByClassName(classOfToggle);
    for (const ele of toggleEles) {
      ele.classList.remove(classOfFocus);
      if (ele.dataset.name === name) {
        ele.classList.add(classOfFocus);
      }
    }
    const plusButton = this._root.querySelectorAll(`button[data-type='plus']`)[0];
    const removeButton = this._root.querySelectorAll(`button[data-type='remove']`)[0];
    if (name === 'private') {
      removeButton.classList.remove(classOfHidden);
      plusButton.classList.add(classOfHidden);
    } else {
      removeButton.classList.add(classOfHidden);
      plusButton.classList.remove(classOfHidden);
    }
  }

  _getSymbolButton(symbol, source) {
    return `<button data-type="symbol" data-source="${source}" data-symbol="${symbol}">${symbol}</button>`;
  }

  _getPanel(panelName) {
    return this._root.querySelectorAll(`#symbol-area [data-name='${panelName}']`)[0];
  }

  _initialize() {
    const historyPanel = this._getPanel(panel.history);
    for (const symbol of this._specialSymbol.history) {
      historyPanel.insertAdjacentHTML('afterbegin', this._getSymbolButton(symbol, panel.history));
    }
    const privatePanel = this._getPanel(panel.private);
    for (const symbol of this._specialSymbol.private) {
      privatePanel.insertAdjacentHTML('beforeend', this._getSymbolButton(symbol, panel.private));
    }
  }

  _onkeydown(e) {
    e.preventDefault();
    if (e.keyCode === keyboard.space) {
      ipcRenderer.send(ipcEvent.SYMBOL_INPUT, {word: ' '});
    } else {
      ipcRenderer.send(ipcEvent.KEYDOWN_FROM_CHILD, {
        keyCode: e.keyCode,
        child: 'symbolInputTool',
      });
    }
  }

  _recordHistory(symbol) {
    const historyIndex = this._specialSymbol.history.indexOf(symbol);
    const historyPanel = this._getPanel(panel.history);
    if (historyIndex > -1) {
      this._specialSymbol.history.splice(historyIndex, 1);
      historyPanel.removeChild(historyPanel.childNodes[historyPanel.childNodes.length - historyIndex - 1]);
    } else {
      while (this._specialSymbol.history.length >= maxHistoryLength) {
        this._specialSymbol.history.shift();
        historyPanel.removeChild(historyPanel.childNodes[historyPanel.childNodes.length - 1]);
      }
    }
    this._specialSymbol.history.push(symbol);
    historyPanel.insertAdjacentHTML('afterbegin', this._getSymbolButton(symbol, panel.history));
    this._saveSymbolSetting();
  }

  _saveSymbolSetting() {
    ipcRenderer.send(ipcEvent.SAVE_SYMBOL_DATA, this._specialSymbol);
  }

  _showNotice(type, symbol) {
    let str = '';
    if (type === noticeType.existed) {
      str = `"${symbol}" 已存在於自訂列表`;
    } else if (type === noticeType.success) {
      str = `"${symbol}" 已成功加入自訂列表`;
    }
    this._root.querySelectorAll('#notice')[0].innerHTML = str;
  }

  constructor() {
    this._root = document.body;
    this._root.onkeydown = this._onkeydown;
    this.isPlusMode = false;
    this.isRemoveMode = false;
    this.currentPanel = panel.special;
    this._specialSymbol = {
      history: [],
      private: [],
    };

    ipcRenderer.send(ipcEvent.REQUIRE_SYMBOL_DATA);

    this._root.addEventListener('click', (e) => {
      const clickInfo = e.target.dataset;
      if (clickInfo.type === clickEvents.symbol) {
        if (this.isPlusMode && this.currentPanel != panel.private) {
          this.addPrivateSymbol(clickInfo.symbol);
        } else if (this.isRemoveMode && this.currentPanel === panel.private) {
          this.removePrivateSymbol(clickInfo.symbol);
        } else {
          ipcRenderer.send(ipcEvent.SYMBOL_INPUT, {word: clickInfo.symbol});
          if (clickInfo.source != panel.history) {
            this._recordHistory(clickInfo.symbol);
          }
        }
      } else if (clickInfo.type === clickEvents.toggle) {
        this.toggleSymbolDisplay(clickInfo.name);
      } else if (clickInfo.type === clickEvents.plus) {
        this.togglePlusMode();
      } else if (clickInfo.type === clickEvents.remove) {
        this.toggleRemoveMode();
      }
    });

    ipcRenderer.on(ipcEvent.SET_GLOBAL_COLOR, (event, colorInfo) => {
      this.setBrickColor(colorInfo);
    });
    ipcRenderer.on(ipcEvent.GET_SYMBOL_DATA, (event, data) => {
      this._specialSymbol = data;
      this._initialize();
    });
  }
};

new SymbolPanel();
