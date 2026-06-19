(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.file) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      src: '',
      filename: '',
      filesize: '',
      description: '',
      className: ''
    };
  }

  registry.register('file', {
    title: 'File',
    label: 'File',
    fallbackIcon: '📎',
    category: 'Media',
    description: 'Downloadable file link block (PDF, doc, etc).',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'file', attrs: Object.assign(createDefaults(), attrs || {}) }),
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
