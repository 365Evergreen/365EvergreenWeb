(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.audio = window.EditorBlockModules.audio || {};

  module.controls = {
    toolbar: {
      default: ['align', 'replace'],
      ellipsis: ['common']
    },
    inspector: {
      settings: ['autoplay', 'loop', 'preload'],
      styles: ['dimensions'],
      advanced: ['anchor', 'className']
    }
  };
})();
