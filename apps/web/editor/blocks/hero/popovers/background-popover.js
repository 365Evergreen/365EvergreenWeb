(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.hero = window.EditorBlockModules.hero || {};
  module.popovers = module.popovers || {};

  module.popovers.background = {
    id: 'hero-background',
    title: 'Background',
    fields: ['backgroundImage', 'backgroundColor', 'overlayColor', 'minHeight']
  };
})();
