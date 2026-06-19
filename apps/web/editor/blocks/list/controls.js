(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.list = window.EditorBlockModules.list || {};

  module.controls = {
    toolbar: ['align', 'ordered-toggle', 'indent', 'outdent', 'bold', 'italic', 'link', 'more'],
    inspector: {
      settings: ['ordered', 'start', 'reverse'],
      styles: ['color', 'typography', 'dimensions'],
      advanced: ['anchor', 'className']
    }
  };
})();
