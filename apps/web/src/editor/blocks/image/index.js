(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.image) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      src: '',
      alt: '',
      caption: '',
      link: { href: '', target: '_blank' },
      width: '',
      height: '',
      loading: 'lazy',
      focalPoint: { x: 50, y: 50 },
      style: { border: '', radius: '' },
      className: '',
      align: 'wide'
    };
  }

  registry.register('image', {
    title: 'Image',
    label: 'Image',
    fallbackIcon: 'I',
    category: 'Media',
    description: 'Uploaded or library-backed image block.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'image', attrs: Object.assign(createDefaults(), attrs || {}) }),
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
