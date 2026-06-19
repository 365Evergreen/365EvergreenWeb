(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.grid) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      columns: 3,
      minWidth: '180px',
      gap: '20px',
      text: 'Add grid content summary',
      items: [[], [], []],
      className: '',
      align: 'wide'
    };
  }

  function normalizeItems(items, columns) {
    const count = Math.max(1, Number(columns) || 3);
    const next = Array.isArray(items) ? items.slice(0, count) : [];
    while (next.length < count) next.push([]);
    return next;
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const columns = Math.max(1, Number(attrs.columns) || 3);
    const items = normalizeItems(attrs.items, columns);
    const wrap = document.createElement('section');
    wrap.className = ['pe-block-grid', attrs.align ? `align-${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    wrap.style.gridTemplateColumns = `repeat(${columns}, minmax(${attrs.minWidth || '180px'}, 1fr))`;
    wrap.style.gap = attrs.gap || '20px';
    items.forEach((item, index) => {
      const cell = document.createElement('div');
      cell.className = 'pe-block-grid__cell';
      cell.textContent = Array.isArray(item) && item.length ? `Cell ${index + 1} (${item.length} items)` : `Cell ${index + 1}`;
      wrap.appendChild(cell);
    });
    if (attrs.text) {
      const summary = document.createElement('p');
      summary.className = 'pe-block-grid__summary';
      summary.textContent = attrs.text;
      wrap.appendChild(summary);
    }
    return wrap;
  }

  registry.register('grid', {
    title: 'Grid',
    label: 'Grid',
    fallbackIcon: '▦',
    category: 'Layout',
    description: 'Uniform grid shell with configurable columns and minimum width.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => {
      const nextAttrs = Object.assign(createDefaults(), attrs || {});
      nextAttrs.columns = Math.max(1, Number(nextAttrs.columns) || 3);
      nextAttrs.items = normalizeItems(nextAttrs.items, nextAttrs.columns);
      return { id: null, type: 'grid', attrs: nextAttrs };
    },
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  }, { after: 'row' });
})();
