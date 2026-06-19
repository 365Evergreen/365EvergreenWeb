(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.icon = window.EditorBlockModules.icon || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  function html(value) {
    return typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(value) : String(value || '');
  }

  function resolveGlyph(icon) {
    const key = String(icon || '').trim().toLowerCase();
    const glyphs = { star: '★', info: 'ℹ', check: '✓', plus: '+', search: '⌕', arrow: '→', warning: '⚠', heart: '♥', spark: '✦' };
    if (glyphs[key]) return glyphs[key];
    return icon || '★';
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = ['pe-block-icon', attrs.align ? `align${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    const label = attrs.label ? `<span class="pe-block-icon__label">${html(attrs.label)}</span>` : '';
    return `<div class="${attr(className)}"><span class="pe-block-icon__glyph" style="font-size:${attr(attrs.size || '48px')};color:${attr(attrs.color || '#02760c')}">${html(resolveGlyph(attrs.icon))}</span>${label}</div>`;
  };
})();
