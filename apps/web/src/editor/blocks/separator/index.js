(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.separator) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      style: 'default',
      className: '',
      align: 'full'
    };
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const hr = document.createElement('hr');
    hr.className = [
      'pe-block-separator',
      `is-style-${attrs.style || 'default'}`,
      attrs.className || ''
    ].join(' ').trim();
    return hr;
  }

  registry.register('separator', {
    title: 'Separator',
    label: 'Separator',
    fallbackIcon: '-',
    category: 'Design',
    description: 'Visual divider between sections.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'separator', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
