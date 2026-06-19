(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.list = window.EditorBlockModules.list || {};
  const listUtils = window.EditorListUtils || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function normalizeListItems(items) {
    return typeof listUtils.normalizeListItems === 'function'
      ? listUtils.normalizeListItems(items)
      : (Array.isArray(items) ? items : [{ content: '', children: [] }]);
  }

  function getListStyleAttribute(attrs, ordered) {
    const typography = attrs && attrs.style && attrs.style.typography ? attrs.style.typography : {};
    const spacing = attrs && attrs.style && attrs.style.spacing ? attrs.style.spacing : {};
    const markerStyle = typeof listUtils.resolveListMarkerStyle === 'function'
      ? listUtils.resolveListMarkerStyle(ordered, attrs && attrs.markerStyle ? attrs.markerStyle : '')
      : (attrs && attrs.markerStyle ? attrs.markerStyle : '');
    return typeof htmlUtils.toInlineStyle === 'function'
      ? htmlUtils.toInlineStyle({
          'text-align': attrs && attrs.align ? attrs.align : '',
          'font-size': typography.fontSize,
          'font-weight': typography.fontWeight,
          'line-height': typography.lineHeight,
          color: typography.textColor,
          'background-color': typography.backgroundColor,
          'list-style-type': markerStyle,
          '--pe-list-item-gap': spacing.itemGap,
          '--pe-list-indent-width': spacing.indentWidth
        })
      : '';
  }

  function renderListItems(items, ordered, attrs) {
    return normalizeListItems(items).map((item) => {
      const content = item && item.content ? item.content : '';
      const children = item && Array.isArray(item.children) && item.children.length
        ? renderListTree(item.children, ordered, attrs)
        : '';
      return `<li>${content}${children}</li>`;
    }).join('');
  }

  function renderListTree(items, ordered, attrs) {
    const tagName = ordered ? 'ol' : 'ul';
    const className = ['pe-block-list-tree', attrs && attrs.className ? attrs.className : ''].join(' ').trim();
    const style = getListStyleAttribute(attrs, ordered);
    const classAttr = className ? ` class="${typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(className) : className}"` : '';
    const styleAttr = style ? ` style="${typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(style) : style}"` : '';
    return `<${tagName}${classAttr}${styleAttr}>${renderListItems(items, ordered, attrs)}</${tagName}>`;
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    return renderListTree(attrs.items, !!attrs.ordered, attrs);
  };
})();
