(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.callout = window.EditorBlockModules.callout || {};

  module.controls = {
    toolbar: ['align', 'more'],
    inspector: {
      settings: ['variant', 'showIcon'],
      advanced: ['className']
    }
  };
  module.popovers = module.popovers || {};
  module.popovers.display = {
    id: 'callout-display',
    title: 'Display',
    fields: ['variant', 'showIcon']
  };
})();
