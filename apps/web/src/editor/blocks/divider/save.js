(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.divider = window.EditorBlockModules.divider || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  function resolveWidth(width) {
    if (width === 'wide') return '72%';
    if (width === 'narrow') return '40%';
    if (width === 'full') return '100%';
    return width || '100%';
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = ['pe-block-divider', `is-style-${attrs.style || 'solid'}`, attrs.align ? `align${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    return `<hr class="${attr(className)}" style="border-top-style:${attr(attrs.style || 'solid')};border-top-width:${attr(attrs.thickness || '2px')};width:${attr(resolveWidth(attrs.width))}">`;
  };
})();
