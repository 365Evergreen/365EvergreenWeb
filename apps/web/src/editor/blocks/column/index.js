(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.column) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      width: '1fr',
      className: '',
      children: []
    };
  }

  function saveChildren(children) {
    const runtimeUtils = window.EditorBlockRuntimeUtils || {};
    return typeof runtimeUtils.saveBlocks === 'function' ? runtimeUtils.saveBlocks(children || []) : '';
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const wrap = document.createElement('div');
    wrap.className = ['pe-block-column', attrs.className || ''].join(' ').trim();
    wrap.style.setProperty('--pe-column-width', attrs.width || '1fr');

    const childrenMarkup = saveChildren(attrs.children);
    if (childrenMarkup) {
      wrap.innerHTML = childrenMarkup;
    } else {
      const empty = document.createElement('div');
      empty.className = 'pe-block-column__empty';
      empty.textContent = 'Column';
      wrap.appendChild(empty);
    }
    return wrap;
  }

  registry.register('column', {
    title: 'Column',
    label: 'Column',
    fallbackIcon: '▦',
    category: 'Design',
    description: 'Single column container used inside Columns.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'column', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
