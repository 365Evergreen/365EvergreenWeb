(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.row = window.EditorBlockModules.row || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  function html(value) {
    return typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(value) : String(value || '');
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = ['pe-block-row', attrs.align ? `align${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    const text = attrs.text ? `<p class="pe-block-row__text">${html(attrs.text)}</p>` : '';
    return `<section class="${attr(className)}" style="justify-content:${attr(attrs.justify || 'space-between')};gap:${attr(attrs.gap || '16px')};flex-wrap:${attrs.wrap === false ? 'nowrap' : 'wrap'}"><div class="pe-block-row__content"><h3 class="pe-block-row__title">${html(attrs.title || 'Row')}</h3>${text}</div><div class="pe-block-row__slot">Row items</div></section>`;
  };
})();
