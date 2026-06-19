(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.embed = window.EditorBlockModules.embed || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  function html(value) {
    return typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(value) : String(value || '');
  }

  function getAspectRatioStyle(value) {
    const match = String(value || '').trim().match(/^(\d+(?:\.\d+)?)\s*[x/:]\s*(\d+(?:\.\d+)?)$/i);
    if (!match) return '16 / 9';
    return `${match[1]} / ${match[2]}`;
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = ['pe-block-embed', attrs.align ? `align${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    const caption = attrs.caption ? `<figcaption class="pe-block-embed__caption">${html(attrs.caption)}</figcaption>` : '';
    const ratioStyle = `aspect-ratio:${attr(getAspectRatioStyle(attrs.aspectRatio))}`;
    if (attrs.html) {
      return `<figure class="${attr(className)}"><div class="pe-block-embed__frame pe-block-embed__html" style="${ratioStyle}">${attrs.html}</div>${caption}</figure>`;
    }
    if (attrs.url) {
      const title = attrs.provider || attrs.caption || 'Embedded content';
      return `<figure class="${attr(className)}"><div class="pe-block-embed__frame" style="${ratioStyle}"><iframe src="${attr(attrs.url)}" title="${attr(title)}" loading="lazy" allowfullscreen></iframe></div>${caption}</figure>`;
    }
    return `<figure class="${attr(className)}"><div class="pe-block-embed__empty">Embed content</div>${caption}</figure>`;
  };
})();
