(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.separator = window.EditorBlockModules.separator || {};

  module.controls = {
    toolbar: ['align', 'more'],
    inspector: {
      settings: ['style'],
      advanced: ['className']
    }
  };
})();
