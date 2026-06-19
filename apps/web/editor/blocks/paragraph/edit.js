(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.paragraph = window.EditorBlockModules.paragraph || {};

  module.edit = ({ block, blockElement, editable, helpers }) => {
    const target = editable || (helpers && typeof helpers.getEditableElement === 'function'
      ? helpers.getEditableElement(blockElement)
      : null);
    if (!target || !helpers || typeof helpers.attachTextBlockHandlers !== 'function') return false;
    helpers.attachTextBlockHandlers(blockElement, block, target);
    return true;
  };
})();
