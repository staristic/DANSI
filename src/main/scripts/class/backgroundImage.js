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
    this._backgroundImage.style.width = `${this._backgroundImage.naturalWidth * this._rate / 10}px`;
    this._backgroundImage.style.height = `${this._backgroundImage.naturalHeight * this._rate / 10}px`;
  }

  _handleBackgroundImageSet(e) {
    const openBackgroundImage = (img) => {
      const reader = new FileReader();
      reader.onload = () => {
        this._backgroundImage.src = reader.result;
        this.setBackgroundImageOpacity();
        setTimeout(() => {
          this.setZoomRate();
        }, 0);
      };
      reader.readAsDataURL(img);
    };
    switch (e.target.type) {
      case inputType.file:
        openBackgroundImage(e.target.files[0]);
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

  constructor(panel, image) {
    this._panel = panel;
    this._backgroundImage = image;
    this._diffX = 0;
    this._diffY = 0;
    this._opacity = defaultOpacity;
    this._rate = 10;
    this._rotate = 0;

    this._panel.addEventListener('input', (e) => {
      this._handleBackgroundImageSet(e);
    });

    this._panel.querySelectorAll('button[data-feature=openImg]')[0].addEventListener('click', (e) => {
      this._panel.querySelectorAll('input[accept]')[0].click();
    });
  };
};
