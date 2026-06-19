(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.gallery = window.EditorBlockModules.gallery || {};

  module.controls = {
    toolbar: {
      default: ['align', 'crop-images', 'add'],
      ellipsis: ['common']
    },
    inspector: {
      settings: ['columns', 'crop', 'randomize', 'linkTo', 'image-size'],
      styles: ['color', 'dimensions'],
      advanced: ['anchor', 'className']
    }
  };
})();
