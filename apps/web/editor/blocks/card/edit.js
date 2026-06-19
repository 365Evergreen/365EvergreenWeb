(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.card = window.EditorBlockModules.card || {};

  function getShadowValue(shadow) {
    if (shadow === 'soft') return '0 12px 30px rgba(15,23,42,0.08)';
    if (shadow === 'outlined') return '0 0 0 1px rgba(15,23,42,0.12)';
    return '0 18px 40px rgba(15,23,42,0.14)';
  }

  function setCaretByCharacterOffset(element, offset) {
    if (!element || !window.getSelection) return;
    const selection = window.getSelection();
    if (!selection) return;
    const targetOffset = Math.max(0, Number(offset) || 0);
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    let remaining = targetOffset;
    let currentNode = null;
    while ((currentNode = walker.nextNode())) {
      const textLength = currentNode.textContent ? currentNode.textContent.length : 0;
      if (remaining <= textLength) {
        const range = document.createRange();
        range.setStart(currentNode, remaining);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        element.focus();
        return;
      }
      remaining -= textLength;
    }
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus();
  }

  function getCaretCharacterOffsetWithin(element) {
    const selection = window.getSelection ? window.getSelection() : null;
    if (!selection || !selection.rangeCount) return 0;
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }

  function restoreFieldFocus(blockId, field, caretOffset) {
    const schedule = window.requestAnimationFrame || function (callback) { return window.setTimeout(callback, 0); };
    schedule(() => {
      const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
      const target = blockElement && blockElement.querySelector(`[data-card-field="${field}"]`);
      if (target) setCaretByCharacterOffset(target, caretOffset);
    });
  }

  function insertPlainText(text) {
    if (document.execCommand) {
      document.execCommand('insertText', false, text);
      return;
    }
    const selection = window.getSelection ? window.getSelection() : null;
    if (!selection || !selection.rangeCount) return;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(text));
  }

  function bindPlainTextField(element, block, field, helpers) {
    if (!element || !block || !block.id || !window.EditorCore) return;
    element.addEventListener('focus', () => {
      if (helpers && typeof helpers.selectBlock === 'function') helpers.selectBlock(block.id);
    });
    element.addEventListener('click', (event) => event.stopPropagation());
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') event.preventDefault();
    });
    element.addEventListener('paste', (event) => {
      if (!event.clipboardData) return;
      event.preventDefault();
      insertPlainText(event.clipboardData.getData('text/plain') || '');
    });
    element.addEventListener('input', () => {
      const caretOffset = getCaretCharacterOffsetWithin(element);
      window.EditorCore.setBlockAttrs(block.id, { [field]: element.textContent || '' });
      restoreFieldFocus(block.id, field, caretOffset);
    });
  }

  module.render = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const root = document.createElement('section');
    root.className = ['pe-block-card', attrs.align ? `align-${attrs.align}` : ''].join(' ').trim();
    root.style.backgroundColor = attrs.backgroundColor || '#ffffff';
    root.style.borderRadius = attrs.borderRadius || '24px';
    root.style.padding = attrs.padding || '1.5rem';
    root.style.boxShadow = getShadowValue(attrs.shadow);

    const title = document.createElement('h3');
    title.className = 'pe-block-card__title pe-richtext';
    title.dataset.cardField = 'title';
    title.dataset.placeholder = 'Card title';
    title.setAttribute('contenteditable', 'true');
    title.setAttribute('role', 'textbox');
    title.textContent = attrs.title || '';

    const text = document.createElement('p');
    text.className = 'pe-block-card__text pe-richtext';
    text.dataset.cardField = 'text';
    text.dataset.placeholder = 'Card body copy';
    text.setAttribute('contenteditable', 'true');
    text.setAttribute('role', 'textbox');
    text.textContent = attrs.text || '';

    root.append(title, text);
    return root;
  };

  module.edit = ({ block, blockElement, helpers }) => {
    if (!blockElement) return false;
    bindPlainTextField(blockElement.querySelector('[data-card-field="title"]'), block, 'title', helpers);
    bindPlainTextField(blockElement.querySelector('[data-card-field="text"]'), block, 'text', helpers);
    return true;
  };
})();
