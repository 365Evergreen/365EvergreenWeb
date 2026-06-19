(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.file = window.EditorBlockModules.file || {};

  module.controls = {
    toolbar: {
      default: ['align', 'replace', 'copy-url', 'link'],
      ellipsis: ['common']
    },
    inspector: {
      settings: ['preview', 'preview-height', 'download-button', 'new-tab'],
      styles: ['color', 'dimensions'],
      advanced: ['anchor', 'className']
    }
  };
})();
