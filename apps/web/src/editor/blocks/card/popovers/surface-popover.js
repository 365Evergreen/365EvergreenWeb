(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.card = window.EditorBlockModules.card || {};
  module.popovers = module.popovers || {};

  module.popovers.surface = {
    id: 'card-surface',
    title: 'Surface',
    fields: ['backgroundColor', 'borderRadius', 'padding', 'shadow']
  };
})();
