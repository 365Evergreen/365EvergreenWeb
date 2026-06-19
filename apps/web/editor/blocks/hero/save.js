(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.hero = window.EditorBlockModules.hero || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value);
  }

  function text(value) {
    return typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(value) : String(value);
  }

  function resolveBackground(attrs) {
    if (attrs && attrs.backgroundImage) {
      const overlay = attrs.overlayColor || 'rgba(15,23,42,0.45)';
      return `linear-gradient(${overlay}, ${overlay}), url(${attrs.backgroundImage}) center/cover`;
    }
    return attrs && attrs.backgroundColor ? attrs.backgroundColor : '#0f172a';
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = ['pe-block-hero', attrs.align ? `align-${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    const style = typeof htmlUtils.toInlineStyle === 'function'
      ? htmlUtils.toInlineStyle({
          background: resolveBackground(attrs),
          color: '#ffffff',
          'min-height': attrs.minHeight || '320px'
        })
      : '';
    const classAttr = className ? ` class="${attr(className)}"` : '';
    const styleAttr = style ? ` style="${attr(style)}"` : '';
    const eyebrow = attrs.eyebrow ? `<p class="pe-block-hero__eyebrow">${text(attrs.eyebrow)}</p>` : '';
    const ctaText = attrs.ctaText ? String(attrs.ctaText).trim() : '';
    const cta = ctaText ? `<a class="pe-block-hero__cta" href="${attr(attrs.ctaHref || '#')}">${text(ctaText)}</a>` : '';
    return `<section${classAttr}${styleAttr}>${eyebrow}<h2 class="pe-block-hero__title">${text(attrs.title || 'Hero title')}</h2><p class="pe-block-hero__text">${text(attrs.text || '')}</p>${cta}</section>`;
  };
})();
