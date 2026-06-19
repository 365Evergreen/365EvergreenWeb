(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.drawer = window.EditorBlockModules.drawer || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  function html(value) {
    return typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(value) : String(value || '');
  }

  function saveChildren(children, options) {
    const runtimeUtils = window.EditorBlockRuntimeUtils || {};
    return typeof runtimeUtils.saveBlocks === 'function' ? runtimeUtils.saveBlocks(children || [], options || {}) : '';
  }

  function getDismissIcon() {
    if (window.EditorDrawerRuntime && typeof window.EditorDrawerRuntime.getDismissIcon === 'function') {
      return window.EditorDrawerRuntime.getDismissIcon();
    }
    return '×';
  }

  module.save = function (block, options) {
    const attrs = block && block.attrs ? block.attrs : {};
    const trigger = attrs.trigger && typeof attrs.trigger === 'object' ? attrs.trigger : {};
    const triggerLabel = trigger.label || 'Open drawer';
    const drawerId = `drawer-panel-${attr(block && block.id ? block.id : 'panel')}`;
    const childrenMarkup = saveChildren(attrs.children, options);
    const position = attrs.position === 'left' ? 'left' : 'right';
    const overlayClass = attrs.overlay === false ? ' is-overlay-disabled' : '';
    const styleAttr = attrs.width ? ` style="--site-drawer-width:${attr(attrs.width)}"` : '';
    return [
      `<div class="pe-block-drawer pe-block-drawer--saved pe-block-drawer--${attr(position)}${overlayClass}">`,
      `<button type="button" class="pe-drawer-trigger primary" aria-controls="${drawerId}" aria-expanded="false">${html(triggerLabel)}</button>`,
      `<div class="site-drawer pe-drawer-shell${overlayClass}" hidden${styleAttr}>`,
      attrs.overlay === false ? '' : '<div class="site-drawer-backdrop pe-drawer-backdrop" hidden></div>',
      `<aside id="${drawerId}" class="site-drawer-panel pe-drawer-panel pe-drawer-panel--${attr(position)}" role="dialog" aria-modal="true" aria-labelledby="${drawerId}-title" hidden>`,
      '<div class="site-drawer-header pe-drawer-panel__header">',
      `<h2 id="${drawerId}-title" class="site-drawer-title pe-drawer-panel__title">${html(triggerLabel)}</h2>`,
      `<button type="button" class="site-drawer-close pe-drawer-dismiss" aria-label="Dismiss drawer">${getDismissIcon()}</button>`,
      '</div>',
      `<div class="site-drawer-body pe-drawer-panel__content">${childrenMarkup}</div>`,
      '</aside>',
      '</div>',
      '</div>'
    ].join('');
  };
})();
