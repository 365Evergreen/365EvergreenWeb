(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.separator = window.EditorBlockModules.separator || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = [
      'pe-block-separator',
      `is-style-${attrs.style || 'default'}`,
      attrs.align ? `align${attrs.align}` : '',
      attrs.className || ''
    ].join(' ').trim();
    return `<hr class="${attr(className)}">`;
  };
})();
