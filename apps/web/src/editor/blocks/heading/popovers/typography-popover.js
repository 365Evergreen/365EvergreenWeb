(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.heading = window.EditorBlockModules.heading || {};
  module.popovers = module.popovers || {};

  module.popovers.typography = {
    id: 'heading-typography',
    title: 'Typography',
    fields: ['fontSize', 'fontWeight', 'lineHeight']
  };
})();
