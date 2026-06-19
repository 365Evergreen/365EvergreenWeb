(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.hero = window.EditorBlockModules.hero || {};
  module.popovers = module.popovers || {};

  module.popovers.cta = {
    id: 'hero-cta',
    title: 'Call to action',
    fields: ['ctaText', 'ctaHref']
  };
})();
