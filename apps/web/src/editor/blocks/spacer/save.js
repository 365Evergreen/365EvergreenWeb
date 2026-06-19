(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.spacer = window.EditorBlockModules.spacer || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = [
      'pe-block-spacer',
      `is-preset-${attrs.preset || 'medium'}`,
      attrs.align ? `align${attrs.align}` : '',
      attrs.className || ''
    ].join(' ').trim();
    return `<div class="${attr(className)}" aria-hidden="true" style="height:${attr(attrs.height || '48px')}"></div>`;
  };
})();
