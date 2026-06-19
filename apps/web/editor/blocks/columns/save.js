(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.columns = window.EditorBlockModules.columns || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  function html(value) {
    return typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(value) : String(value || '');
  }

  function saveChildren(children) {
    const runtimeUtils = window.EditorBlockRuntimeUtils || {};
    return typeof runtimeUtils.saveBlocks === 'function' ? runtimeUtils.saveBlocks(children || []) : '';
  }

  function getTemplate(children, count) {
    const widths = (Array.isArray(children) ? children : []).map((child) => child && child.attrs && child.attrs.width ? child.attrs.width : '1fr');
    if (!widths.length) return `repeat(${Math.max(1, count || 2)}, minmax(0, 1fr))`;
    return widths.join(' ');
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const children = Array.isArray(attrs.children) ? attrs.children : [];
    const className = [
      'pe-block-columns',
      attrs.align ? `align${attrs.align}` : '',
      attrs.className || ''
    ].join(' ').trim();
    const template = getTemplate(children, attrs.columns);
    const childrenMarkup = saveChildren(children);
    const summary = !childrenMarkup && attrs.text ? `<p class="pe-block-columns__summary">${html(attrs.text)}</p>` : '';
    return `<section class="${attr(className)}" style="gap:${attr(attrs.gap || '24px')};--pe-columns-template:${attr(template)}">${childrenMarkup}${summary}</section>`;
  };
})();
