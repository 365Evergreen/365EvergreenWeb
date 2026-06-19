(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.icon = window.EditorBlockModules.icon || {};

  module.controls = {
    toolbar: ['align', 'more'],
    inspector: {
      settings: ['icon', 'label'],
      styles: ['surface'],
      advanced: ['className']
    }
  };
  module.popovers = module.popovers || {};
  module.popovers.appearance = {
    id: 'icon-appearance',
    title: 'Appearance',
    fields: ['icon', 'size', 'color']
  };
})();
