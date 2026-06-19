(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.paragraph = window.EditorBlockModules.paragraph || {};
  module.popovers = module.popovers || {};

  module.popovers.link = {
    id: 'paragraph-link',
    title: 'Link',
    fields: ['href', 'target', 'rel']
  };
})();
