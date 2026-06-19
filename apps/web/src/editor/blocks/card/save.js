(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.card = window.EditorBlockModules.card || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value);
  }

  function text(value) {
    return typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(value) : String(value);
  }

  function getShadowValue(shadow) {
    if (shadow === 'soft') return '0 12px 30px rgba(15,23,42,0.08)';
    if (shadow === 'outlined') return '0 0 0 1px rgba(15,23,42,0.12)';
    return '0 18px 40px rgba(15,23,42,0.14)';
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = ['pe-block-card', attrs.align ? `align-${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    const style = typeof htmlUtils.toInlineStyle === 'function'
      ? htmlUtils.toInlineStyle({
          'background-color': attrs.backgroundColor || '#ffffff',
          'border-radius': attrs.borderRadius || '24px',
          padding: attrs.padding || '1.5rem',
          'box-shadow': getShadowValue(attrs.shadow)
        })
      : '';
    const classAttr = className ? ` class="${attr(className)}"` : '';
    const styleAttr = style ? ` style="${attr(style)}"` : '';
    return `<section${classAttr}${styleAttr}><h3 class="pe-block-card__title">${text(attrs.title || 'Card title')}</h3><p class="pe-block-card__text">${text(attrs.text || '')}</p></section>`;
  };
})();
