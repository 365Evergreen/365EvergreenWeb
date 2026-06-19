(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.cover = window.EditorBlockModules.cover || {};

  module.controls = {
    toolbar: {
      default: ['align'],
      ellipsis: ['common']
    },
    inspector: {
      settings: ['background', 'overlay', 'layout'],
      styles: ['dimensions'],
      advanced: ['className']
    }
  };
})();
