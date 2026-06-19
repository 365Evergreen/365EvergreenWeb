(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.columns = window.EditorBlockModules.columns || {};

  module.controls = {
    toolbar: ['align', 'more'],
    inspector: {
      settings: ['columns', 'gap'],
      advanced: ['className']
    }
  };
})();
