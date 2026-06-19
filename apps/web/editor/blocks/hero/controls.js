(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.hero = window.EditorBlockModules.hero || {};

  module.controls = {
    toolbar: {
      default: ['align'],
      ellipsis: ['common']
    },
    inspector: {
      settings: ['content', 'cta', 'align'],
      styles: ['background'],
      advanced: ['className']
    }
  };
})();
