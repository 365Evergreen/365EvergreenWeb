(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.card) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      title: 'Card title',
      text: 'Card body copy',
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      shadow: 'medium',
      padding: '1.5rem',
      className: '',
      align: 'wide'
    };
  }

  registry.register('card', {
    title: 'Card',
    label: 'Card',
    fallbackIcon: '▣',
    category: 'Design',
    description: 'Highlighted container shell with surface styling.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'card', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : function () { return false; },
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  }, { after: 'divider' });
})();
