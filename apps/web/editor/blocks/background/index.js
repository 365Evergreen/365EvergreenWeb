(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.background) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      title: 'Background section',
      text: 'Wrapped content summary',
      background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
      overlay: '',
      padding: '2rem',
      borderRadius: '24px',
      className: '',
      align: 'wide'
    };
  }

  function resolveBackground(attrs) {
    if (attrs && attrs.overlay) return `linear-gradient(${attrs.overlay}, ${attrs.overlay}), ${attrs.background || 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)'}`;
    return attrs && attrs.background ? attrs.background : 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)';
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const wrap = document.createElement('section');
    wrap.className = ['pe-block-background', attrs.align ? `align-${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    wrap.style.background = resolveBackground(attrs);
    wrap.style.padding = attrs.padding || '2rem';
    wrap.style.borderRadius = attrs.borderRadius || '24px';

    const title = document.createElement('h3');
    title.className = 'pe-block-background__title';
    title.textContent = attrs.title || 'Background section';
    const text = document.createElement('p');
    text.className = 'pe-block-background__text';
    text.textContent = attrs.text || '';
    wrap.append(title, text);
    return wrap;
  }

  registry.register('background', {
    title: 'Background',
    label: 'Background',
    fallbackIcon: '▒',
    category: 'Design',
    description: 'Stylized wrapper section with background treatments.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'background', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  }, { after: 'hero' });
})();
