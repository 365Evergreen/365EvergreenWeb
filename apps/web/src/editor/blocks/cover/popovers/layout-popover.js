(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.cover = window.EditorBlockModules.cover || {};
  module.popovers = module.popovers || {};

  module.popovers.layout = {
    id: 'cover-layout',
    title: 'Layout',
    fields: ['minHeight', 'contentPosition', 'style.layout', 'overlay.color', 'overlay.opacity']
  };
})();
