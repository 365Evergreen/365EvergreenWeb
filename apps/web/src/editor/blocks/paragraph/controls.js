(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.paragraph = window.EditorBlockModules.paragraph || {};

  module.controls = {
    toolbar: ['align', 'bold', 'italic', 'link', 'more'],
    inspector: {
      settings: ['drop-cap'],
      styles: ['color', 'typography', 'dimensions'],
      advanced: ['anchor', 'className']
    }
  };
})();
