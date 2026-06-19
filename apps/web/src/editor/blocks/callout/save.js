(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.callout = window.EditorBlockModules.callout || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  function html(value) {
    return typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(value) : String(value || '');
  }

  function resolveIcon(variant) {
    const icons = { info: 'ℹ', success: '✓', warning: '⚠', error: '⨯', tip: '✦' };
    return icons[String(variant || 'info').toLowerCase()] || 'ℹ';
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = ['pe-block-callout', `is-variant-${attrs.variant || 'info'}`, attrs.align ? `align${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    const icon = attrs.showIcon === false ? '' : `<span class="pe-block-callout__icon" aria-hidden="true">${html(resolveIcon(attrs.variant))}</span>`;
    return `<aside class="${attr(className)}">${icon}<div class="pe-block-callout__content"><strong class="pe-block-callout__title">${html(attrs.title || 'Notice title')}</strong><p class="pe-block-callout__text">${html(attrs.text || '')}</p></div></aside>`;
  };
})();
