const classOfHidden = 'hidden';
const classOfZoom = 'zoom';
const clickEvent = {
  close: 'close',
  save: 'save',
  zoom: 'zoom',
};

export const ImageDisplayer = class ImageDisplayer {
  hide() {
    this.root.classList.add(classOfHidden);
  }

  save() {
    this.download.setAttribute('download', `${this.name || '未命名'}.png`);
    this.download.setAttribute('href', this.canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
    this.download.click();
  }

  show(hash, name) {
    this._clear();
    this.root.classList.remove(classOfHidden);
    this.name = name;
    const canvases = document.querySelectorAll(`.ansi-canvas-${hash} canvas`);
    const rowHeight = canvases[0].height;
    this.canvas.width = canvases[0].width;
    this.canvas.height = canvases.length * rowHeight;
    const context = this.canvas.getContext('2d');
    for (let i = 0, l = canvases.length; i < l; i++) {
      context.drawImage(canvases[i], 0, i * rowHeight);
    }
  }

  zoom() {
    if (this.canvas.classList.contains(classOfZoom)) {
      this.canvas.classList.remove(classOfZoom);
    } else {
      this.canvas.classList.add(classOfZoom);
    }
  }

  _clear() {
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  constructor( ) {
    this.root = document.getElementById('image-displayer');
    this.download = document.getElementById('for-save');
    this.canvas = this.root.querySelectorAll('canvas')[0];

    this.root.addEventListener('click', (e) => {
      switch (e.target.className) {
        case clickEvent.close:
          this.hide();
          break;
        case clickEvent.save:
          this.save();
          break;
        case clickEvent.zoom:
          this.zoom();
          break;
        default:
          return;
      }
    });
  };
};
