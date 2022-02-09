import {listenEvents, triggerEvent, EventList, EventFeature} from '../tool/events.js';
import {tagTemplate, tagFeaturesName} from '../../templates/tagTemplate.js';
const classOfFileTag = 'file-tag';
const classOfFocus = 'focus';
const classOfSaved = 'saved';
const buttonFeature = {
  copyAll: 'copy-all',
  newFile: 'new-file',
  open: 'open',
  redo: 'redo',
  save: 'save',
  show: 'show',
  undo: 'undo',
};

export const Tag = class Tag {
  fileSaved(hash) {
    for (const fileTag of this._fileTagBar.getElementsByClassName(classOfFileTag)) {
      if (fileTag.dataset.hash === hash) {
        fileTag.classList.add(classOfSaved);
        return;
      }
    }
  }

  fileUnSaved(hash) {
    for (const fileTag of this._fileTagBar.getElementsByClassName(classOfFileTag)) {
      if (fileTag.dataset.hash === hash) {
        fileTag.classList.remove(classOfSaved);
        return;
      }
    }
  }

  newTag(hash, fileName) {
    this._fileTagBar.innerHTML = this._fileTagBar.innerHTML + tagTemplate(hash, fileName);
    this.setTagFocus(hash);
    this.fileSaved(hash); // new file is saved
  }

  removeTag(hash) {
    for (const fileTag of this._fileTagBar.querySelectorAll('[data-hash]')) {
      if (fileTag.dataset.hash === hash) {
        fileTag.parentNode.removeChild(fileTag);
      }
    }
  }

  setTagFocus(hash) {
    for (const fileTag of this._fileTagBar.getElementsByClassName(classOfFileTag)) {
      fileTag.classList.remove(classOfFocus);
      if (fileTag.dataset.hash === hash) {
        fileTag.classList.add(classOfFocus);
      }
    }
  }

  constructor( ) {
    this._root = document.getElementById('file-bar');
    this._fileTagBar = document.getElementById('file-tag-bar');

    this._root.addEventListener('click', (e) => {
      switch (e.target.dataset.feature) {
        case buttonFeature.copyAll:
          triggerEvent(EventList.COPY_ALL, null, EventFeature.onlyTriggerCurrentCanvas);
          break;
        case buttonFeature.newFile:
          triggerEvent(EventList.NEW_FILE, null);
          break;
        case buttonFeature.save:
          triggerEvent(EventList.SAVE_FILE, null);
          break;
        case buttonFeature.open:
          triggerEvent(EventList.OPEN_FILE, null);
          break;
        case buttonFeature.show:
          triggerEvent(EventList.SHOW_IMAGE);
          break;
        case buttonFeature.redo:
          triggerEvent(EventList.REDO, null, EventFeature.onlyTriggerCurrentCanvas);
          break;
        case buttonFeature.undo:
          triggerEvent(EventList.UNDO, null, EventFeature.onlyTriggerCurrentCanvas);
          break;
        case tagFeaturesName.close:
          triggerEvent(EventList.CLOSE_FILE, e.target.dataset.hash);
          break;
        case tagFeaturesName.tag:
          triggerEvent(EventList.FOCUS_FILE, e.target.dataset.hash);
          break;
        default:
          return;
      }
    });

    listenEvents(EventList.FILE_SAVED, this, 'fileSaved');
    listenEvents(EventList.FILE_UNSAVED, this, 'fileUnSaved');
  }
};
