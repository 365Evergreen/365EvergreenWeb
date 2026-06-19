(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.icon) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      icon: 'star',
      size: '48px',
      color: '#02760c',
      label: '',
      className: '',
      align: 'left'
    };
  }

  function resolveGlyph(icon) {
    const key = String(icon || '').trim().toLowerCase();
    const glyphs = { star: '★', info: 'ℹ', check: '✓', plus: '+', search: '⌕', arrow: '→', warning: '⚠', heart: '♥', spark: '✦' };
    if (glyphs[key]) return glyphs[key];
    return icon || '★';
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const wrap = document.createElement('div');
    wrap.className = ['pe-block-icon', attrs.align ? `align-${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    const glyph = document.createElement('span');
    glyph.className = 'pe-block-icon__glyph';
    glyph.textContent = resolveGlyph(attrs.icon);
    glyph.style.fontSize = attrs.size || '48px';
    glyph.style.color = attrs.color || '#02760c';
    wrap.appendChild(glyph);
    if (attrs.label) {
      const label = document.createElement('span');
      label.className = 'pe-block-icon__label';
      label.textContent = attrs.label;
      wrap.appendChild(label);
    }
    return wrap;
  }

  registry.register('icon', {
    title: 'Icon',
    label: 'Icon',
    fallbackIcon: '◎',
    category: 'Design',
    description: 'Standalone icon or symbol with size and color settings.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'icon', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  }, { after: 'background' });
})();
