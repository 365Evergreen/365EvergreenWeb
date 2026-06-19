(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.heading = window.EditorBlockModules.heading || {};

  module.controls = {
    toolbar: ['level', 'align', 'bold', 'italic', 'link', 'more'],
    inspector: {
      settings: ['level'],
      styles: ['color', 'typography', 'dimensions'],
      advanced: ['anchor', 'className']
    }
  };
})();
