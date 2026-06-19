(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.divider) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      style: 'solid',
      thickness: '2px',
      width: 'full',
      className: '',
      align: 'full'
    };
  }

  function resolveWidth(width) {
    if (width === 'wide') return '72%';
    if (width === 'narrow') return '40%';
    if (width === 'full') return '100%';
    return width || '100%';
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const divider = document.createElement('hr');
    divider.className = ['pe-block-divider', `is-style-${attrs.style || 'solid'}`, attrs.align ? `align-${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    divider.style.borderTopStyle = attrs.style || 'solid';
    divider.style.borderTopWidth = attrs.thickness || '2px';
    divider.style.width = resolveWidth(attrs.width);
    return divider;
  }

  registry.register('divider', {
    title: 'Divider',
    label: 'Divider',
    fallbackIcon: '=',
    category: 'Design',
    description: 'Decorative divider with style and thickness controls.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'divider', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  }, { after: 'spacer' });
})();
