(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.gallery = window.EditorBlockModules.gallery || {};
  module.popovers = module.popovers || {};

  module.popovers.lightbox = {
    id: 'gallery-lightbox',
    title: 'Lightbox',
    fields: ['lightbox', 'linkTo']
  };
})();
