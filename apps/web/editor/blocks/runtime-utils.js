(function () {
  function clone(value) {
    if (Array.isArray(value)) {
      return value.map(clone);
    }

    if (value && typeof value === 'object') {
      const output = {};
      Object.keys(value).forEach((key) => {
        output[key] = clone(value[key]);
      });
      return output;
    }

    return value;
  }

  function mergeAttrs(defaults, attrs) {
    return Object.assign(clone(defaults || {}), attrs || {});
  }

  function saveBlock(block, options) {
    if (!block) return '';

    if (window.EditorCore && typeof window.EditorCore.saveBlock === 'function') {
      return window.EditorCore.saveBlock(block, options || {});
    }

    const defs = window.EDITOR_BLOCK_DEFINITIONS || {};
    const def = defs[block.type];
    return def && typeof def.save === 'function' ? def.save(block, options || {}) : '';
  }

  function saveBlocks(blocks, options) {
    if (window.EditorCore && typeof window.EditorCore.saveBlocks === 'function') {
      return window.EditorCore.saveBlocks(blocks, options || {});
    }

    return (Array.isArray(blocks) ? blocks : [])
      .map((block) => saveBlock(block, options))
      .filter((value) => typeof value === 'string' && value.length)
      .join('\n');
  }

  function createBlock(type, attrs) {
    const defs = window.EDITOR_BLOCK_DEFINITIONS || {};
    const def = defs[type];
    if (def && typeof def.create === 'function') {
      return def.create(attrs || {});
    }

    return { id: null, type, attrs: attrs || {} };
  }

  function createId(prefix) {
    if (window.EditorCore && typeof window.EditorCore.createId === 'function') {
      return window.EditorCore.createId(prefix || 'b');
    }

    return `${prefix || 'b'}_${Date.now()}`;
  }

  function moveArrayItem(items, fromIndex, toIndex) {
    const list = Array.isArray(items) ? items.slice() : [];
    if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length || fromIndex === toIndex) {
      return list;
    }

    const moved = list.splice(fromIndex, 1);
    if (!moved.length) return list;
    list.splice(toIndex, 0, moved[0]);
    return list;
  }

  function removeArrayItem(items, index) {
    const list = Array.isArray(items) ? items.slice() : [];
    if (index < 0 || index >= list.length) return list;
    list.splice(index, 1);
    return list;
  }

  function renderBlock(block, fallbackType) {
    const defs = window.EDITOR_BLOCK_DEFINITIONS || {};
    const def = defs[block && block.type ? block.type : fallbackType] || defs[fallbackType];
    if (def && typeof def.render === 'function') {
      return def.render(block);
    }

    const fallback = document.createElement('div');
    fallback.className = 'pe-block-runtime-fallback';
    fallback.textContent = block && block.type ? block.type : fallbackType || 'block';
    return fallback;
  }

  window.EditorBlockRuntimeUtils = {
    clone,
    mergeAttrs,
    saveBlock,
    saveBlocks,
    createBlock,
    createId,
    moveArrayItem,
    removeArrayItem,
    renderBlock
  };
})();
