(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.stack) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      gap: '16px',
      align: 'wide',
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
    wrap.className = ['pe-block-stack', attrs.className || ''].join(' ').trim();
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = attrs.gap || '16px';

    const childrenMarkup = saveChildren(attrs.children);
    if (childrenMarkup) {
      wrap.innerHTML = childrenMarkup;
    } else {
      const empty = document.createElement('div');
      empty.className = 'pe-block-stack__empty';
      empty.textContent = 'Stack container';
      wrap.appendChild(empty);
    }
    return wrap;
  }

  registry.register('stack', {
    title: 'Stack',
    label: 'Stack',
    fallbackIcon: '∥',
    category: 'Design',
    description: 'Vertical stack layout container.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'stack', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
