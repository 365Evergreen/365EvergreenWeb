(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.background = window.EditorBlockModules.background || {};

  module.controls = {
    toolbar: ['align', 'more'],
    inspector: {
      settings: ['padding'],
      styles: ['background'],
      advanced: ['className']
    }
  };
  module.popovers = module.popovers || {};
  module.popovers.background = {
    id: 'background-surface',
    title: 'Background',
    fields: ['background', 'overlay', 'padding', 'borderRadius']
  };
})();
