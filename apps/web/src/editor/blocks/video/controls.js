(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.video = window.EditorBlockModules.video || {};

  module.controls = {
    toolbar: {
      default: ['align', 'replace', 'text-tracks'],
      ellipsis: ['common']
    },
    inspector: {
      settings: ['autoplay', 'loop', 'muted', 'controls', 'inline', 'preload', 'poster', 'tracks'],
      styles: ['dimensions'],
      advanced: ['anchor', 'className']
    }
  };
})();
