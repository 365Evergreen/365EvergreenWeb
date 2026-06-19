(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.accordion = window.EditorBlockModules.accordion || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  function html(value) {
    return typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(value) : String(value || '');
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = ['pe-block-accordion', attrs.align ? `align${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    const icon = attrs.showIcon === false ? '' : '<span class="pe-block-accordion__icon" aria-hidden="true">⌄</span>';
    return `<details class="${attr(className)}"${attrs.open ? ' open' : ''}><summary class="pe-block-accordion__summary">${icon}<span>${html(attrs.title || 'Accordion item')}</span></summary><div class="pe-block-accordion__content"><p>${html(attrs.text || '')}</p></div></details>`;
  };
})();
