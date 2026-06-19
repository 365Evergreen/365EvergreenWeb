(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.group = window.EditorBlockModules.group || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  function html(value) {
    return typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(value) : String(value || '');
  }

  function saveChildren(children) {
    const runtimeUtils = window.EditorBlockRuntimeUtils || {};
    return typeof runtimeUtils.saveBlocks === 'function' ? runtimeUtils.saveBlocks(children || []) : '';
  }

  function getTag(tag) {
    return /^[a-z][a-z0-9-]*$/i.test(String(tag || '')) ? String(tag) : 'section';
  }

  function getIntro(attrs, hasChildren) {
    const showTitle = !hasChildren || (attrs.title && attrs.title !== 'Section heading');
    const showText = !hasChildren || !!attrs.text;
    return [
      showTitle ? `<h2 class="pe-block-group__title">${html(attrs.title || 'Section heading')}</h2>` : '',
      showText && attrs.text ? `<p class="pe-block-group__text">${html(attrs.text)}</p>` : ''
    ].join('');
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const tag = getTag(attrs.tag);
    const childrenMarkup = saveChildren(attrs.children);
    const className = [
      'pe-block-group',
      `is-layout-${attrs.layout || 'stack'}`,
      attrs.align ? `align${attrs.align}` : '',
      attrs.className || ''
    ].join(' ').trim();
    const style = typeof htmlUtils.toInlineStyle === 'function'
      ? htmlUtils.toInlineStyle({
          'background-color': attrs.backgroundColor,
          color: attrs.textColor,
          padding: attrs.padding,
          margin: attrs.margin
        })
      : '';
    const styleAttr = style ? ` style="${attr(style)}"` : '';
    const content = `${getIntro(attrs, !!childrenMarkup)}${childrenMarkup}`;
    return `<${tag} class="${attr(className)}"${styleAttr}>${content}</${tag}>`;
  };
})();
