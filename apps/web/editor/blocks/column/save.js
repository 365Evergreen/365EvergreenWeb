(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.column = window.EditorBlockModules.column || {};
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
    const className = ['pe-block-column', attrs.className || ''].join(' ').trim();
    return `<div class="${attr(className)}" style="--pe-column-width:${attr(attrs.width || '1fr')}">${saveChildren(attrs.children)}</div>`;
  };
})();
