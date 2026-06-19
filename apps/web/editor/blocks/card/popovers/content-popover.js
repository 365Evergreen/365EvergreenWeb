(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.card = window.EditorBlockModules.card || {};
  module.popovers = module.popovers || {};

  module.popovers.content = {
    id: 'card-content',
    title: 'Content',
    fields: ['title', 'text']
  };
})();
