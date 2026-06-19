(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.grid = window.EditorBlockModules.grid || {};

  module.controls = {
    toolbar: ['align', 'more'],
    inspector: {
      settings: ['columns', 'minWidth', 'gap'],
      advanced: ['className']
    }
  };
})();
