(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.image = window.EditorBlockModules.image || {};
  module.popovers = module.popovers || {};

  module.popovers.focalPoint = {
    id: 'image-focal-point',
    title: 'Focal point',
    fields: ['focalPoint.x', 'focalPoint.y']
  };
})();
