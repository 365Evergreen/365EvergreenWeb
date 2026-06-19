(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.file = window.EditorBlockModules.file || {};
  module.popovers = module.popovers || {};

  module.popovers.link = {
    id: 'file-link',
    title: 'File link',
    fields: ['src', 'filename']
  };
})();
