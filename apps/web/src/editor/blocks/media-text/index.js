(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules['media-text']) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      media: { type: 'image', src: '', alt: '' },
      text: [{ type: 'paragraph', attrs: { text: '' } }],
      layout: 'media-left',
      gap: '16px',
      className: ''
    };
  }

  registry.register('media-text', {
    title: 'Media & Text',
    label: 'Media & Text',
    fallbackIcon: '⤡',
    category: 'Media',
    description: 'Two-column media with text area.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'media-text', attrs: Object.assign(createDefaults(), attrs || {}) }),
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
