(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.paragraph = window.EditorBlockModules.paragraph || {};
  module.popovers = module.popovers || {};

  module.popovers.color = {
    id: 'paragraph-color',
    title: 'Colors',
    fields: ['textColor', 'backgroundColor']
  };
})();
