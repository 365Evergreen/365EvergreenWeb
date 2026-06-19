(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.image = window.EditorBlockModules.image || {};

  module.controls = {
    toolbar: {
      default: ['align', 'crop', 'cover-transform', 'replace', 'link'],
      ellipsis: ['common']
    },
    inspector: {
      settings: ['alt', 'size', 'dimensions', 'aspect-ratio', 'lightbox', 'link'],
      styles: ['color', 'border', 'shadow', 'duotone', 'dimensions'],
      advanced: ['title', 'anchor', 'className']
    }
  };
})();
