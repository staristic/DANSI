import './about.scss';
import {ipcRenderer} from 'electron';
import {ipcEvent} from '../../assets/script/ipc.js';

const link = document.getElementById('link');

link.onclick = () => {
  ipcRenderer.send(ipcEvent.OPEN_LINK, link.innerHTML);
};
