(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.columns) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      columns: 2,
      gap: '24px',
      text: 'Add column content summary',
      className: '',
      align: 'wide',
      children: []
    };
  }

  function createColumn(attrs) {
    const defs = window.EDITOR_BLOCK_DEFINITIONS || {};
    if (defs.column && typeof defs.column.create === 'function') {
      return defs.column.create(attrs || {});
    }
    return { id: null, type: 'column', attrs: Object.assign({ width: '1fr', className: '', children: [] }, attrs || {}) };
  }

  function normalizeChildren(children, count) {
    const next = Array.isArray(children) ? children.slice() : [];
    const targetCount = Math.max(1, parseInt(count, 10) || next.length || 2);
    while (next.length < targetCount) {
      next.push(createColumn({ width: '1fr' }));
    }
    return next.slice(0, targetCount).map((child) => {
      if (child && child.type === 'column' && child.attrs) {
        return Object.assign({}, child, {
          attrs: Object.assign({ width: '1fr', className: '', children: [] }, child.attrs || {})
        });
      }
      return createColumn(child && child.attrs ? child.attrs : { width: '1fr' });
    });
  }

  function saveChildren(children) {
    const runtimeUtils = window.EditorBlockRuntimeUtils || {};
    return typeof runtimeUtils.saveBlocks === 'function' ? runtimeUtils.saveBlocks(children || []) : '';
  }

  function getTemplate(children, count) {
    const widths = (Array.isArray(children) ? children : []).map((child) => child && child.attrs && child.attrs.width ? child.attrs.width : '1fr');
    if (!widths.length) return `repeat(${Math.max(1, parseInt(count, 10) || 2)}, minmax(0, 1fr))`;
    return widths.join(' ');
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const children = normalizeChildren(attrs.children, attrs.columns);
    const wrap = document.createElement('section');
    wrap.className = ['pe-block-columns', attrs.className || ''].join(' ').trim();
    wrap.style.display = 'grid';
    wrap.style.gap = attrs.gap || '24px';
    wrap.style.gridTemplateColumns = getTemplate(children, attrs.columns);

    const childrenMarkup = saveChildren(children);
    if (childrenMarkup) {
      wrap.innerHTML = childrenMarkup;
    }

    if (!childrenMarkup && attrs.text) {
      const summary = document.createElement('p');
      summary.className = 'pe-block-columns__summary';
      summary.textContent = attrs.text;
      wrap.appendChild(summary);
    }
    return wrap;
  }

  registry.register('columns', {
    title: 'Columns',
    label: 'Columns',
    fallbackIcon: 'Ⅱ',
    category: 'Layout',
    description: 'Multi-column layout shell with adjustable gaps.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => {
      const nextAttrs = Object.assign(createDefaults(), attrs || {});
      nextAttrs.children = normalizeChildren(nextAttrs.children, nextAttrs.columns);
      nextAttrs.columns = nextAttrs.children.length;
      return { id: null, type: 'columns', attrs: nextAttrs };
    },
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
