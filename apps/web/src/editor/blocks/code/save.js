(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.code = window.EditorBlockModules.code || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function getStyleAttribute(attrs) {
    const style = attrs && attrs.style ? attrs.style : {};
    return typeof htmlUtils.toInlineStyle === 'function'
      ? htmlUtils.toInlineStyle({
          'font-size': style.fontSize,
          'font-weight': style.fontWeight,
          'line-height': style.lineHeight,
          color: style.textColor,
          'background-color': style.backgroundColor
        })
      : '';
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = ['pe-block-code', attrs && attrs.className ? attrs.className : ''].join(' ').trim();
    const style = getStyleAttribute(attrs);
    const classAttr = className ? ` class="${typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(className) : className}"` : '';
    const styleAttr = style ? ` style="${typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(style) : style}"` : '';
    const languageAttr = attrs.language
      ? ` data-language="${typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(String(attrs.language).toLowerCase()) : String(attrs.language).toLowerCase()}"`
      : '';
    const codeValue = typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(attrs.code || '') : String(attrs.code || '');
    return `<pre${classAttr}${styleAttr}${languageAttr}><code>${codeValue}</code></pre>`;
  };
})();
