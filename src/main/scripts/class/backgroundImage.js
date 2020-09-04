const defaultOpacity = 0.5;
const inputType = {
  file: 'file',
  number: 'number',
  range: 'range',
};
const inputTarget = {
  diffX: 'diffX',
  diffY: 'diffY',
  opacity: 'opacity',
  rotate: 'rotate',
  width: 'width',
  height: 'height',
};

export const BackgroundImage = class BackgroundImage {
  setBackgroundImageDiffX(x = this._diffX) {
    this._diffX = x;
    this._backgroundImage.style.left = `${this._diffX}px`;
  }

  setBackgroundImageDiffY(y = this._diffY) {
    this._diffY = y;
    this._backgroundImage.style.top = `${this._diffY}px`;
  }

  setBackgroundImageOpacity(opacity = this._opacity) {
    this._opacity = opacity;
    this._backgroundImage.style.opacity = this._opacity;
  }

  setBackgroundImageRotate(angle = 0) {
    this._rotate = angle;
    this._backgroundImage.style.transform = `rotate(${angle}deg)`;
  }

  setZoomRate(rate = this._rate) {
    this._rate = rate;
    this._backgroundImage.style.width = `${this.currentWidth * this._rate / 10}px`;
    this._backgroundImage.style.height = `${this.currentHeight * this._rate / 10}px`;
  }

  openBackgroundImage(img) {
    const reader = new FileReader();
    reader.onload = () => {
      this._backgroundImage.src = reader.result;
      this.setBackgroundImageOpacity();
      setTimeout(() => {
        this.setSizeInfo();
        this.setZoomRate();
      }, 0);
    };
    reader.readAsDataURL(img);
  };

  _handleBackgroundImageSet(e) {
    switch (e.target.type) {
      case inputType.file:
        this.openBackgroundImage(e.target.files[0]);
        break;
      case inputType.number:
        switch (e.target.dataset.feature) {
          case inputTarget.diffX:
            this.setBackgroundImageDiffX(parseInt(e.target.value));
            break;
          case inputTarget.diffY:
            this.setBackgroundImageDiffY(parseInt(e.target.value));
            break;
          case inputTarget.rotate:
            this.setBackgroundImageRotate(parseInt(e.target.value));
            break;
          case inputTarget.width:
            this.calcNewHeight(parseInt(e.target.value));
            break;
          case inputTarget.height:
            this.calcNewWidth(parseInt(e.target.value));
            break;
        }
      case inputType.range: // opacity and rotate
        switch (e.target.dataset.feature) {
          case inputTarget.opacity:
            this.setBackgroundImageOpacity(parseInt(e.target.value) / 100);
            break;
        }
        break;
      default:
        return;
    }
  }

  calcNewHeight(newWidth) {
    this.setSizeInfo({
      width: newWidth,
      height: parseInt(newWidth * this._backgroundImage.naturalHeight / this._backgroundImage.naturalWidth),
    });
  }

  calcNewWidth(newWidth) {
    this.setSizeInfo({
      width: newWidth,
      height: parseInt(newWidth * this._backgroundImage.naturalHeight / this._backgroundImage.naturalWidth),
    });
  }

  setSizeInfo(info) {
    this.currentWidth = info ? info.width : this._backgroundImage.naturalWidth;
    this.currentHeight = info ? info.height : this._backgroundImage.naturalHeight;
    this._panel.querySelectorAll('input[data-feature=width]')[0].value = this.currentWidth;
    this._panel.querySelectorAll('input[data-feature=height]')[0].value = this.currentHeight;
    this.setZoomRate();
  }

  constructor(panel, image) {
    this._panel = panel;
    this._backgroundImage = image;
    this._diffX = 0;
    this._diffY = 0;
    this._opacity = defaultOpacity;
    this._rate = 10;
    this._rotate = 0;
    this.currentWidth = 0;
    this.currentHeight = 0;

    this._panel.addEventListener('input', (e) => {
      this._handleBackgroundImageSet(e);
    });

    this._panel.querySelectorAll('button[data-feature=openImg]')[0].addEventListener('click', (e) => {
      this._panel.querySelectorAll('input[accept]')[0].click();
    });
  };
};
