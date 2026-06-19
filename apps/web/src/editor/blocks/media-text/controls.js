(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules['media-text'] = window.EditorBlockModules['media-text'] || {};

  module.controls = {
    toolbar: {
      default: ['align', 'media-position', 'vertical-align', 'crop-fill', 'replace'],
      ellipsis: ['common']
    },
    inspector: {
      settings: ['stack-mobile', 'crop-fill', 'media-width', 'featured-image', 'alt', 'link'],
      styles: ['color', 'typography', 'dimensions'],
      advanced: ['anchor', 'className']
    }
  };
})();
