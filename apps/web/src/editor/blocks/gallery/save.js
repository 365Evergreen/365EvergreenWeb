(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.gallery = window.EditorBlockModules.gallery || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value);
  }

  function renderImage(image, linkTo) {
    const img = `<img class="pe-gallery-image" src="${attr(image.src || '')}" alt="${attr(image.alt || '')}" loading="lazy">`;
    if (linkTo === 'media' && image.src) return `<a class="pe-gallery-media-link" href="${attr(image.src)}">${img}</a>`;
    return img;
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const images = Array.isArray(attrs.images) ? attrs.images : [];
    const className = ['pe-block-gallery', attrs.className || '', attrs.crop !== false ? 'is-cropped' : '', attrs.lightbox ? 'has-lightbox' : ''].join(' ').trim();
    const figures = images.map((image) => `<figure class="pe-gallery-item">${renderImage(image, attrs.linkTo)}${image.caption ? `<figcaption class="pe-gallery-caption">${image.caption}</figcaption>` : ''}</figure>`).join('');
    return `<div class="${attr(className)}" style="--pe-gallery-columns:${attr(String(attrs.columns || 3))}">${figures}</div>`;
  };
})();
