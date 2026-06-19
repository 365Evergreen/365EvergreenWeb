(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.file = window.EditorBlockModules.file || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value);
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = ['pe-block-file', attrs.className || ''].join(' ').trim();
    const label = attrs.filename || 'Download file';
    const description = attrs.description ? `<div class="pe-file-description">${attrs.description}</div>` : '';
    const filesize = attrs.filesize ? `<span class="pe-file-size">${attrs.filesize}</span>` : '';
    return `<div class="${attr(className)}"><a href="${attr(attrs.src || '#')}" download>${label}</a>${filesize}${description}</div>`;
  };
})();
