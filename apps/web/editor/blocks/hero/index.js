(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.hero) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      eyebrow: '',
      title: 'Hero title',
      text: 'Supporting hero copy',
      backgroundImage: '',
      backgroundColor: '#0f172a',
      overlayColor: 'rgba(15,23,42,0.45)',
      minHeight: '320px',
      ctaText: '',
      ctaHref: '',
      className: '',
      align: 'full'
    };
  }

  registry.register('hero', {
    title: 'Hero',
    label: 'Hero',
    fallbackIcon: '★',
    category: 'Design',
    description: 'Large banner section with background and optional CTA.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'hero', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : function () { return false; },
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  }, { after: 'card' });
})();
