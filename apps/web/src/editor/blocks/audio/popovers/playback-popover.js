(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.audio = window.EditorBlockModules.audio || {};
  module.popovers = module.popovers || {};

  module.popovers.playback = {
    id: 'audio-playback',
    title: 'Playback',
    fields: ['autoplay', 'loop', 'preload']
  };
})();
