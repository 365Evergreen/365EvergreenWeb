(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.stack = window.EditorBlockModules.stack || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  function saveChildren(children) {
    const runtimeUtils = window.EditorBlockRuntimeUtils || {};
    return typeof runtimeUtils.saveBlocks === 'function' ? runtimeUtils.saveBlocks(children || []) : '';
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = [
      'pe-block-stack',
      attrs.align ? `align${attrs.align}` : '',
      attrs.className || ''
    ].join(' ').trim();
    const childrenMarkup = saveChildren(attrs.children);
    return `<div class="${attr(className)}" style="gap:${attr(attrs.gap || '16px')}">${childrenMarkup}</div>`;
  };
})();
