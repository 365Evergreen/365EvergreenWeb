(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.heading = window.EditorBlockModules.heading || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function getStyleAttribute(attrs) {
    const style = attrs && attrs.style ? attrs.style : {};
    return typeof htmlUtils.toInlineStyle === 'function'
      ? htmlUtils.toInlineStyle({
          'text-align': attrs && attrs.align ? attrs.align : '',
          'font-size': style.fontSize,
          'font-weight': style.fontWeight,
          'line-height': style.lineHeight,
          color: style.textColor,
          'background-color': style.backgroundColor
        })
      : '';
  }

  function getClassAttribute(attrs, level) {
    return [`pe-block-heading pe-heading-level-${level}`, attrs && attrs.className ? attrs.className : '']
      .join(' ')
      .trim();
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const level = Math.min(6, Math.max(1, Number(attrs.level) || 2));
    const className = getClassAttribute(attrs, level);
    const style = getStyleAttribute(attrs);
    const classAttr = className ? ` class="${typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(className) : className}"` : '';
    const styleAttr = style ? ` style="${typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(style) : style}"` : '';
    return `<h${level}${classAttr}${styleAttr}>${attrs.text || ''}</h${level}>`;
  };
})();
