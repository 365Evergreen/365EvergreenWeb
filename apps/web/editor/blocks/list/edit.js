(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.list = window.EditorBlockModules.list || {};

  module.edit = ({ block, blockElement, helpers }) => {
    if (!helpers || typeof helpers.attachListHandlers !== 'function') return false;
    helpers.attachListHandlers(blockElement, block);
    return true;
  };
})();
