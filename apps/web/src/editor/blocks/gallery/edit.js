(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.gallery = window.EditorBlockModules.gallery || {};

  module.edit = ({ block, blockElement, helpers }) => {
    if (!helpers || typeof helpers.attachGalleryHandlers !== 'function') return false;
    helpers.attachGalleryHandlers(blockElement, block);
    return true;
  };
})();
