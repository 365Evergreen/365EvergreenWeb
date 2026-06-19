(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.image = window.EditorBlockModules.image || {};
  module.popovers = module.popovers || {};

  module.popovers.altText = {
    id: 'image-alt-text',
    title: 'Alt text',
    fields: ['alt']
  };
})();
