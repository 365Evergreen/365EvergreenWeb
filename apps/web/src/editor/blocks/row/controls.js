(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.row = window.EditorBlockModules.row || {};

  module.controls = {
    toolbar: ['align', 'more'],
    inspector: {
      settings: ['justify', 'gap', 'wrap'],
      advanced: ['className']
    }
  };
})();
