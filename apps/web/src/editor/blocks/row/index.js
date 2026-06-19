(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.row) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      title: 'Row',
      text: 'Horizontal layout content summary',
      justify: 'space-between',
      gap: '16px',
      wrap: true,
      className: '',
      align: 'wide'
    };
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const wrap = document.createElement('section');
    wrap.className = ['pe-block-row', attrs.align ? `align-${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    wrap.style.justifyContent = attrs.justify || 'space-between';
    wrap.style.gap = attrs.gap || '16px';
    wrap.style.flexWrap = attrs.wrap === false ? 'nowrap' : 'wrap';

    const content = document.createElement('div');
    content.className = 'pe-block-row__content';
    const title = document.createElement('h3');
    title.className = 'pe-block-row__title';
    title.textContent = attrs.title || 'Row';
    const text = document.createElement('p');
    text.className = 'pe-block-row__text';
    text.textContent = attrs.text || '';
    content.append(title, text);

    const slot = document.createElement('div');
    slot.className = 'pe-block-row__slot';
    slot.textContent = 'Row items';

    wrap.append(content, slot);
    return wrap;
  }

  registry.register('row', {
    title: 'Row',
    label: 'Row',
    fallbackIcon: '↔',
    category: 'Layout',
    description: 'Horizontal layout shell with wrap and alignment settings.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'row', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  }, { after: 'column' });
})();
