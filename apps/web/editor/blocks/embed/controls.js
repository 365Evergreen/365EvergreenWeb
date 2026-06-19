(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.embed = window.EditorBlockModules.embed || {};

  module.controls = {
    toolbar: ['align', 'more'],
    inspector: {
      settings: ['url', 'provider', 'aspectRatio', 'caption'],
      advanced: ['className']
    }
  };
})();
