(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules['media-text'] = window.EditorBlockModules['media-text'] || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value);
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const media = attrs.media || {};
    const className = ['pe-block-media-text', attrs.className || '', attrs.layout || 'media-left'].join(' ').trim();
    const mediaMarkup = media.src ? `<div class="mt-media"><img src="${attr(media.src)}" alt="${attr(media.alt || '')}"></div>` : '<div class="mt-media"></div>';
    const textMarkup = Array.isArray(attrs.text)
      ? attrs.text.map((entry) => `<p>${entry && entry.attrs && entry.attrs.text ? entry.attrs.text : ''}</p>`).join('')
      : '';
    return `<section class="${attr(className)}" style="gap:${attr(attrs.gap || '16px')}">${mediaMarkup}<div class="mt-text">${textMarkup}</div></section>`;
  };
})();
