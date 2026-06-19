(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.accordion = window.EditorBlockModules.accordion || {};

  module.edit = ({ block, blockElement, helpers }) => {
    if (!block || !block.id || !blockElement || !window.EditorCore) return false;
    const summary = blockElement.querySelector('[data-accordion-toggle]');
    if (!summary) return false;
    summary.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (helpers && typeof helpers.selectBlock === 'function') helpers.selectBlock(block.id);
      window.EditorCore.setBlockAttrs(block.id, { open: !(block.attrs && block.attrs.open) });
    });
    return true;
  };
})();
