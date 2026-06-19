(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.spacer) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      height: '48px',
      preset: 'medium',
      className: '',
      align: 'full'
    };
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const spacer = document.createElement('div');
    spacer.className = [
      'pe-block-spacer',
      `is-preset-${attrs.preset || 'medium'}`,
      attrs.className || ''
    ].join(' ').trim();
    spacer.setAttribute('aria-hidden', 'true');
    spacer.style.height = attrs.height || '48px';
    return spacer;
  }

  registry.register('spacer', {
    title: 'Spacer',
    label: 'Spacer',
    fallbackIcon: '↕',
    category: 'Design',
    description: 'Vertical whitespace block with adjustable height.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'spacer', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
