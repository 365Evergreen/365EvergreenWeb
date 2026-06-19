(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.background = window.EditorBlockModules.background || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  function html(value) {
    return typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(value) : String(value || '');
  }

  function resolveBackground(attrs) {
    if (attrs && attrs.overlay) return `linear-gradient(${attrs.overlay}, ${attrs.overlay}), ${attrs.background || 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)'}`;
    return attrs && attrs.background ? attrs.background : 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)';
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = ['pe-block-background', attrs.align ? `align${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    const style = typeof htmlUtils.toInlineStyle === 'function'
      ? htmlUtils.toInlineStyle({
          background: resolveBackground(attrs),
          padding: attrs.padding || '2rem',
          'border-radius': attrs.borderRadius || '24px'
        })
      : '';
    const styleAttr = style ? ` style="${attr(style)}"` : '';
    return `<section class="${attr(className)}"${styleAttr}><h3 class="pe-block-background__title">${html(attrs.title || 'Background section')}</h3><p class="pe-block-background__text">${html(attrs.text || '')}</p></section>`;
  };
})();
