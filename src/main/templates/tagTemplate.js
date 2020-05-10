export const tagFeaturesName = {
  close: 'close',
  tag: 'tag',
};

export const tagTemplate = (hash, fileName = '未命名') => {
  return `<div data-hash="${hash}">
            <button class="file-tag" data-feature=${tagFeaturesName.tag} data-hash="${hash}">${fileName}</button>
            <button class="close" data-hash="${hash}" data-feature=${tagFeaturesName.close}>X</button>
          </div>`;
};
