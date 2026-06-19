(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.cover = window.EditorBlockModules.cover || {};
  module.popovers = module.popovers || {};

  module.popovers.background = {
    id: 'cover-background',
    title: 'Background',
    fields: ['background.type', 'background.src', 'background.poster', 'background.fixed']
  };
})();
