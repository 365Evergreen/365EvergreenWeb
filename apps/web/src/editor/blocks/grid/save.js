(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.grid = window.EditorBlockModules.grid || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};
  const runtimeUtils = window.EditorBlockRuntimeUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  function html(value) {
    return typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(value) : String(value || '');
  }

  function saveCell(items, index) {
    if (typeof runtimeUtils.saveBlocks === 'function' && Array.isArray(items) && items.length && items.some((entry) => entry && entry.type)) {
      const markup = runtimeUtils.saveBlocks(items);
      if (markup) return `<div class="pe-block-grid__cell">${markup}</div>`;
    }
    return `<div class="pe-block-grid__cell"><span>Cell ${index + 1}</span></div>`;
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const columns = Math.max(1, Number(attrs.columns) || 3);
    const items = Array.isArray(attrs.items) ? attrs.items.slice(0, columns) : [];
    while (items.length < columns) items.push([]);
    const className = ['pe-block-grid', attrs.align ? `align${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    const summary = attrs.text ? `<p class="pe-block-grid__summary">${html(attrs.text)}</p>` : '';
    return `<section class="${attr(className)}" style="grid-template-columns:repeat(${columns}, minmax(${attr(attrs.minWidth || '180px')}, 1fr));gap:${attr(attrs.gap || '20px')}">${items.map(saveCell).join('')}${summary}</section>`;
  };
})();
