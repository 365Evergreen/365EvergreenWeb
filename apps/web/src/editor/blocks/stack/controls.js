(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.stack = window.EditorBlockModules.stack || {};

  module.controls = {
    toolbar: ['align', 'more'],
    inspector: {
      settings: ['gap'],
      advanced: ['className']
    }
  };
})();
