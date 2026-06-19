(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.audio) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      src: '',
      title: '',
      artist: '',
      autoplay: false,
      loop: false,
      preload: 'metadata',
      className: ''
    };
  }

  registry.register('audio', {
    title: 'Audio',
    label: 'Audio',
    fallbackIcon: '♫',
    category: 'Media',
    description: 'Audio player for uploaded or linked audio files.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'audio', attrs: Object.assign(createDefaults(), attrs || {}) }),
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
