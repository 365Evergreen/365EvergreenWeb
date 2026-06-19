(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.list = window.EditorBlockModules.list || {};
  module.popovers = module.popovers || {};

  module.popovers.listSettings = {
    id: 'list-settings',
    title: 'List settings',
    fields: ['ordered', 'markerStyle']
  };
})();
