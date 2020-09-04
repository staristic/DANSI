export const canvasTemplate =
`
  <div class="canvas-frame">
    <div class="canvas-shield">
      <div class="current-canvas">
        <div class="sensor">
          <div class="touch-panel"></div>
          <div class="pointer">
            <input>
          </div>
        </div>
        <div class="background-image-area">
          <img>
        </div>
        <div class="canvas-area"></div>
      </div>
    </div>
  </div>
  <div class="status-area">
    <div class="background-image-setting">
      <div>
        <div>
          <input type="file" accept="image/*">
          <button data-feature="openImg" class="tooltip">
            <img src="./assets/icons/image-solid.svg">
            <span class="tooltiptext">選擇背景圖片</span>
          </button>
        </div>
      </div>
      <div>
        <div class="opacity-text">
          <span>透明度：</span>
        </div>
        <div class="range-slider imgae-opacity">
          <input type="range" data-feature="opacity">
        </div>
      </div>
      <div>
        <span>寬(px)</span>
        <input type="number" data-feature="width" value=0>
        <span>高(px)</span>
        <input type="number" data-feature="height" value=0>
      </div>
      <div>
        <div class="rotate-text">
          <span>旋轉：</span>
        </div>
        <div>
          <input type="number" step=1 min=-180 max=180 data-feature="rotate" value=0>
        </div>
      </div>
      <div class="image-diff">
        <span>位移：</span>
        <span>向下(px)</span>
        <input type="number" data-feature="diffY" value=0>
        <span>向右(px)</span>
        <input type="number" data-feature="diffX" value=0>
      </div>
    </div>
    <div class="zoom">
      <div class="rate-text">
        <span>畫面比例</span>
      </div>
      <div class="range-slider">
        <input type="range" min="50" max="300" step="10" value="100">
      </div>
      <div>
        <span><b>100</b>%</span>
      </div>
    </div>
    <div class="current-size">
      <span>檔案寬度:<b>80</b>  檔案高度:<b>1</b></span>
    </div>
    <div class="current-position">
      <p><b>0,0</b></p>
    </div>
  </div>
`;
