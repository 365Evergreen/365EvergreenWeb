(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules['search-results'] = window.EditorBlockModules['search-results'] || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = ['pe-block-search-results', attrs.align ? `align${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    return `<section class="${attr(className)}" data-source="${attr(attrs.dataSource || '')}" data-template="${attr(attrs.template || 'card')}" data-columns="${attr(attrs.columns || 3)}" data-page-size="${attr(attrs.pageSize || 6)}" data-show-modified="${attrs.showModified === false ? 'false' : 'true'}" data-show-contributors="${attrs.showContributors === false ? 'false' : 'true'}"><div class="pe-block-search-results__placeholder">Search results render at runtime.</div></section>`;
  };
})();
