(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.hero = window.EditorBlockModules.hero || {};

  function resolveBackground(attrs) {
    if (attrs && attrs.backgroundImage) {
      const overlay = attrs.overlayColor || 'rgba(15,23,42,0.45)';
      return `linear-gradient(${overlay}, ${overlay}), url(${attrs.backgroundImage}) center/cover`;
    }
    return attrs && attrs.backgroundColor ? attrs.backgroundColor : '#0f172a';
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
      const target = blockElement && blockElement.querySelector(`[data-hero-field="${field}"]`);
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

  function bindPlainTextField(element, block, field, helpers, options) {
    if (!element || !block || !block.id || !window.EditorCore) return;
    const config = Object.assign({ multiline: false }, options || {});
    element.addEventListener('focus', () => {
      if (helpers && typeof helpers.selectBlock === 'function') helpers.selectBlock(block.id);
    });
    element.addEventListener('click', (event) => {
      event.stopPropagation();
      if (field === 'ctaText') event.preventDefault();
    });
    element.addEventListener('keydown', (event) => {
      if (!config.multiline && event.key === 'Enter') event.preventDefault();
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
    root.className = ['pe-block-hero', attrs.align ? `align-${attrs.align}` : ''].join(' ').trim();
    root.style.background = resolveBackground(attrs);
    root.style.color = '#ffffff';
    root.style.minHeight = attrs.minHeight || '320px';

    const content = document.createElement('div');
    content.className = 'pe-block-hero__content';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'pe-block-hero__eyebrow pe-richtext';
    eyebrow.dataset.heroField = 'eyebrow';
    eyebrow.dataset.placeholder = 'Featured';
    eyebrow.setAttribute('contenteditable', 'true');
    eyebrow.setAttribute('role', 'textbox');
    eyebrow.textContent = attrs.eyebrow || '';

    const title = document.createElement('h2');
    title.className = 'pe-block-hero__title pe-richtext';
    title.dataset.heroField = 'title';
    title.dataset.placeholder = 'Hero title';
    title.setAttribute('contenteditable', 'true');
    title.setAttribute('role', 'textbox');
    title.textContent = attrs.title || '';

    const text = document.createElement('p');
    text.className = 'pe-block-hero__text pe-richtext';
    text.dataset.heroField = 'text';
    text.dataset.placeholder = 'Supporting hero copy';
    text.setAttribute('contenteditable', 'true');
    text.setAttribute('role', 'textbox');
    text.textContent = attrs.text || '';

    const cta = document.createElement('a');
    cta.className = 'pe-block-hero__cta pe-richtext';
    cta.dataset.heroField = 'ctaText';
    cta.dataset.placeholder = 'Call to action';
    cta.setAttribute('contenteditable', 'true');
    cta.setAttribute('role', 'link');
    cta.href = attrs.ctaHref || '#';
    cta.textContent = attrs.ctaText || '';

    content.append(eyebrow, title, text, cta);
    root.appendChild(content);
    return root;
  };

  module.edit = ({ block, blockElement, helpers }) => {
    if (!blockElement) return false;
    bindPlainTextField(blockElement.querySelector('[data-hero-field="eyebrow"]'), block, 'eyebrow', helpers);
    bindPlainTextField(blockElement.querySelector('[data-hero-field="title"]'), block, 'title', helpers);
    bindPlainTextField(blockElement.querySelector('[data-hero-field="text"]'), block, 'text', helpers, { multiline: true });
    bindPlainTextField(blockElement.querySelector('[data-hero-field="ctaText"]'), block, 'ctaText', helpers);
    return true;
  };
})();
