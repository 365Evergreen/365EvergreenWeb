(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.group = window.EditorBlockModules.group || {};

  module.controls = {
    toolbar: ['align', 'more'],
    inspector: {
      settings: ['tag', 'layout', 'padding', 'margin'],
      styles: ['color'],
      advanced: ['className']
    }
  };
})();
