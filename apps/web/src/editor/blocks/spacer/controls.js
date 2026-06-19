(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.spacer = window.EditorBlockModules.spacer || {};

  module.controls = {
    toolbar: ['align', 'more'],
    inspector: {
      settings: ['height', 'preset'],
      advanced: ['className']
    }
  };
})();
