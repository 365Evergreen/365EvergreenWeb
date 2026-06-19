(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.divider = window.EditorBlockModules.divider || {};

  module.controls = {
    toolbar: ['align', 'more'],
    inspector: {
      settings: ['style', 'thickness', 'width'],
      advanced: ['className']
    }
  };
})();
