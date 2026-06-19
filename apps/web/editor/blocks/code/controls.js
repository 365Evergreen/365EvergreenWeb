(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.code = window.EditorBlockModules.code || {};

  module.controls = {
    toolbar: ['align', 'more'],
    inspector: {
      settings: ['language'],
      styles: ['color', 'typography', 'dimensions'],
      advanced: ['anchor', 'className']
    }
  };
})();
