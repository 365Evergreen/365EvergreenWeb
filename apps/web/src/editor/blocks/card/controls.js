(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.card = window.EditorBlockModules.card || {};

  module.controls = {
    toolbar: {
      default: ['align'],
      ellipsis: ['common']
    },
    inspector: {
      settings: ['align'],
      styles: ['surface'],
      advanced: ['className']
    }
  };
})();
