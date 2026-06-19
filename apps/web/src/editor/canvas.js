/* Canvas implementation: maintain block list, render via EditorCore.renderTree, and attach editing behaviors. */
(function(){
  const canvas = document.getElementById('pe-editor-canvas');
  if (!canvas) return;

  const TEXT_BLOCK_TYPES = new Set(['paragraph', 'heading']);
  const MERGEABLE_TEXT_TYPES = new Set(['paragraph', 'heading']);
  const RICH_TEXT_TYPES = new Set(['paragraph', 'heading', 'list']);
  const writebackTimers = new Map();
  const EditorListUtils = window.EditorListUtils || {};
  const EditorGalleryUtils = window.EditorGalleryUtils || {};

  let blocks = (window.EditorCore && typeof EditorCore.getBlocks === 'function') ? EditorCore.getBlocks() : [];
  let selectedId = (window.EditorCore && typeof EditorCore.getState === 'function') ? EditorCore.getState().selectedId : null;
  let selectedIds = (window.EditorCore && typeof EditorCore.getSelectedBlockIds === 'function') ? EditorCore.getSelectedBlockIds() : (selectedId ? [selectedId] : []);
  let selectedGallerySelection = null;
  let pendingFocus = null;

  function createDefaultBlock(type, attrs){
    const defs = window.EDITOR_BLOCK_DEFINITIONS || {};
    const def = defs[type];
    if (def && typeof def.create === 'function') return def.create(attrs);
    const id = (window.EditorCore && typeof EditorCore.createId === 'function') ? EditorCore.createId('b') : ('b-'+Math.random().toString(36).slice(2,9));
    return { type, id, attrs: attrs || {} };
  }

  function getBlockIndex(id){
    const match = findBlockEntry(id);
    return match ? match.index : -1;
  }

  function getBlockById(id){
    const match = findBlockEntry(id);
    return match ? match.block : null;
  }

  function getChildBlocks(block) {
    return block && block.attrs && Array.isArray(block.attrs.children) ? block.attrs.children : [];
  }

  function findBlockEntry(id, sourceBlocks, parentBlock){
    const list = Array.isArray(sourceBlocks) ? sourceBlocks : blocks;
    for (let index = 0; index < list.length; index += 1) {
      const block = list[index];
      if (!block) continue;
      if (block.id === id) return { block, index, list, parentBlock: parentBlock || null };
      const childMatch = findBlockEntry(id, getChildBlocks(block), block);
      if (childMatch) return childMatch;
    }
    return null;
  }

  function getBlockIdFromElement(element){
    if (!element || !element.getAttribute) return null;
    return element.getAttribute('data-block-id') || element.getAttribute('data-id');
  }

  function getBlockElement(id){
    return document.querySelector(`[data-block-id='${id}']`) || document.querySelector(`[data-id='${id}']`);
  }

  function reflectSelection(){
    const activeIds = new Set((selectedIds && selectedIds.length ? selectedIds : (selectedId ? [selectedId] : [])));
    document.querySelectorAll('[data-block-id], [data-id]').forEach((element) => {
      element.classList.toggle('block-selected', activeIds.has(getBlockIdFromElement(element)));
    });
  }

  function normalizeGalleryImages(images) {
    if (typeof EditorGalleryUtils.normalizeGalleryImages === 'function') return EditorGalleryUtils.normalizeGalleryImages(images);
    return Array.isArray(images) ? images.map((image) => Object.assign({ id: '', src: '', alt: '', caption: '' }, image || {})) : [];
  }

  function cloneGalleryImages(images) {
    return JSON.parse(JSON.stringify(normalizeGalleryImages(images)));
  }

  function updateGalleryImageById(images, imageId, updater) {
    return cloneGalleryImages(images).map((image) => image.id === imageId ? Object.assign({}, image, updater(image) || {}) : image);
  }

  function moveGalleryImage(images, fromIndex, toIndex) {
    const nextImages = cloneGalleryImages(images);
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= nextImages.length || toIndex >= nextImages.length) return nextImages;
    const [moved] = nextImages.splice(fromIndex, 1);
    nextImages.splice(toIndex, 0, moved);
    return nextImages;
  }

  function queueFocus(blockId, options){
    pendingFocus = Object.assign({ blockId, position: 'end' }, options || {});
  }

  function getListItemElements(blockElement){
    return Array.from(blockElement ? blockElement.querySelectorAll('.pe-list-item-content[contenteditable]') : []);
  }

  function normalizeListItems(items, options) {
    const allowEmpty = !!(options && options.allowEmpty);
    if (typeof EditorListUtils.normalizeListItems === 'function') return EditorListUtils.normalizeListItems(items, options);
    const source = Array.isArray(items) && items.length ? items : (allowEmpty ? [] : [{ content: '', children: [] }]);
    return source.map((item) => {
      if (typeof item === 'string') return { content: item, children: [] };
      return {
        content: typeof item.content === 'string' ? item.content : '',
        children: normalizeListItems(item.children || [], { allowEmpty: true })
      };
    });
  }

  function createListStyle(style) {
    if (typeof EditorListUtils.createListStyle === 'function') return EditorListUtils.createListStyle(style);
    return Object.assign({
      typography: {
        fontSize: '',
        fontWeight: '',
        lineHeight: '',
        textColor: '',
        backgroundColor: ''
      },
      spacing: {
        itemGap: '',
        indentWidth: ''
      }
    }, style || {});
  }

  function parseItemPath(value) {
    return String(value || '')
      .split('.')
      .filter((part) => part.length > 0)
      .map((part) => Number(part))
      .filter((part) => !Number.isNaN(part));
  }

  function serializeItemPath(path) {
    return (path || []).join('.');
  }

  function cloneListItems(items) {
    return JSON.parse(JSON.stringify(normalizeListItems(items)));
  }

  function getListItemAtPath(items, path) {
    let currentItems = items;
    let currentItem = null;
    for (let index = 0; index < path.length; index += 1) {
      currentItem = currentItems[path[index]];
      if (!currentItem) return null;
      currentItems = currentItem.children || [];
    }
    return currentItem;
  }

  function getListSiblingsAtPath(items, path) {
    let currentItems = items;
    for (let index = 0; index < path.length - 1; index += 1) {
      const currentItem = currentItems[path[index]];
      if (!currentItem) return null;
      currentItems = currentItem.children || [];
    }
    return currentItems;
  }

  function replaceListItemContent(items, path, content) {
    const nextItems = cloneListItems(items);
    const item = getListItemAtPath(nextItems, path);
    if (!item) return nextItems;
    item.content = content;
    return nextItems;
  }

  function flattenListPaths(items, parentPath) {
    return normalizeListItems(items, { allowEmpty: true }).flatMap((item, index) => {
      const nextPath = (parentPath || []).concat(index);
      return [nextPath].concat(flattenListPaths(item.children || [], nextPath));
    });
  }

  function insertListItemAfterPath(items, path, item) {
    const nextItems = cloneListItems(items);
    const siblings = getListSiblingsAtPath(nextItems, path);
    if (!siblings) return { items: nextItems, focusPath: path };
    const insertIndex = path[path.length - 1] + 1;
    siblings.splice(insertIndex, 0, item);
    const focusPath = path.slice(0, -1).concat(insertIndex);
    return { items: nextItems, focusPath };
  }

  function removeListItemAtPath(items, path) {
    const nextItems = cloneListItems(items);
    const siblings = getListSiblingsAtPath(nextItems, path);
    if (!siblings) return { items: nextItems, removed: null };
    const removed = siblings.splice(path[path.length - 1], 1)[0] || null;
    return { items: nextItems, removed };
  }

  function getPreviousVisibleListPath(items, path) {
    const flatPaths = flattenListPaths(items);
    const currentIndex = flatPaths.findIndex((entry) => serializeItemPath(entry) === serializeItemPath(path));
    return currentIndex > 0 ? flatPaths[currentIndex - 1] : null;
  }

  function getNextVisibleListPath(items, path) {
    const flatPaths = flattenListPaths(items);
    const currentIndex = flatPaths.findIndex((entry) => serializeItemPath(entry) === serializeItemPath(path));
    return currentIndex >= 0 && currentIndex < flatPaths.length - 1 ? flatPaths[currentIndex + 1] : null;
  }

  function indentListItem(items, path) {
    if (!path.length || path[path.length - 1] === 0) return { items: cloneListItems(items), focusPath: path };
    const nextItems = cloneListItems(items);
    const siblings = getListSiblingsAtPath(nextItems, path);
    if (!siblings) return { items: nextItems, focusPath: path };
    const itemIndex = path[path.length - 1];
    const [item] = siblings.splice(itemIndex, 1);
    if (!item) return { items: nextItems, focusPath: path };
    const previousSibling = siblings[itemIndex - 1];
    previousSibling.children = Array.isArray(previousSibling.children) ? previousSibling.children : [];
    previousSibling.children.push(item);
    const focusPath = path.slice(0, -1).concat(itemIndex - 1, previousSibling.children.length - 1);
    return { items: nextItems, focusPath };
  }

  function outdentListItem(items, path) {
    if (path.length < 2) return { items: cloneListItems(items), focusPath: path };
    const nextItems = cloneListItems(items);
    const parentPath = path.slice(0, -1);
    const parentSiblings = getListSiblingsAtPath(nextItems, parentPath);
    const parentIndex = parentPath[parentPath.length - 1];
    const parentItem = parentSiblings ? parentSiblings[parentIndex] : null;
    if (!parentItem || !Array.isArray(parentItem.children)) return { items: nextItems, focusPath: path };
    const [item] = parentItem.children.splice(path[path.length - 1], 1);
    if (!item) return { items: nextItems, focusPath: path };
    parentSiblings.splice(parentIndex + 1, 0, item);
    const focusPath = parentPath.slice(0, -1).concat(parentIndex + 1);
    return { items: nextItems, focusPath };
  }

  function mergeListItemWithPrevious(items, path) {
    const previousPath = getPreviousVisibleListPath(items, path);
    if (!previousPath) return { items: cloneListItems(items), focusPath: path, merged: false };
    const nextItems = cloneListItems(items);
    const currentItem = getListItemAtPath(nextItems, path);
    const previousItem = getListItemAtPath(nextItems, previousPath);
    if (!currentItem || !previousItem) return { items: nextItems, focusPath: path, merged: false };
    const previousTextLength = stripHtml(previousItem.content || '').length;
    previousItem.content = `${previousItem.content || ''}${currentItem.content || ''}`;
    previousItem.children = (previousItem.children || []).concat(currentItem.children || []);
    const result = removeListItemAtPath(nextItems, path);
    return {
      items: result.items,
      focusPath: previousPath,
      merged: true,
      caretOffset: previousTextLength
    };
  }

  function moveListItem(items, fromPath, targetPath, placement) {
    const fromKey = serializeItemPath(fromPath);
    const targetKey = serializeItemPath(targetPath);
    if (!fromKey || !targetKey || fromKey === targetKey || targetKey.startsWith(`${fromKey}.`)) {
      return { items: cloneListItems(items), focusPath: fromPath };
    }
    const removal = removeListItemAtPath(items, fromPath);
    const item = removal.removed;
    if (!item) return { items: removal.items, focusPath: fromPath };
    const nextItems = removal.items;
    if (placement === 'child') {
      const targetItem = getListItemAtPath(nextItems, targetPath);
      if (!targetItem) return { items: nextItems, focusPath: fromPath };
      targetItem.children = Array.isArray(targetItem.children) ? targetItem.children : [];
      targetItem.children.push(item);
      return { items: nextItems, focusPath: targetPath.concat(targetItem.children.length - 1) };
    }
    const siblings = getListSiblingsAtPath(nextItems, targetPath);
    if (!siblings) return { items: nextItems, focusPath: fromPath };
    const targetIndex = targetPath[targetPath.length - 1] + (placement === 'after' ? 1 : 0);
    siblings.splice(targetIndex, 0, item);
    return { items: nextItems, focusPath: targetPath.slice(0, -1).concat(targetIndex) };
  }

  function getEditableElement(blockElement, focusOptions){
    if (!blockElement) return null;
    const blockType = blockElement.dataset.blockType;
    if (blockType === 'list') {
      const items = getListItemElements(blockElement);
      if (!items.length) return null;
      if (focusOptions && focusOptions.itemPath) {
        return items.find((item) => item.dataset.itemPath === focusOptions.itemPath) || items[items.length - 1];
      }
      const index = focusOptions && typeof focusOptions.listItemIndex === 'number'
        ? Math.max(0, Math.min(items.length - 1, focusOptions.listItemIndex))
        : items.length - 1;
      return items[index];
    }
    if (blockElement.matches('[contenteditable]')) return blockElement;
    return blockElement.querySelector('[contenteditable]');
  }

  function setCaret(element, position){
    if (!element) return;
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(position !== 'end');
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus();
  }

  function setCaretByCharacterOffset(element, offset){
    if (!element) return;
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
    setCaret(element, 'end');
  }

  function applyPendingFocus(){
    if (!pendingFocus) return;
    const focusRequest = pendingFocus;
    pendingFocus = null;
    requestAnimationFrame(() => {
      const blockElement = getBlockElement(focusRequest.blockId);
      const editable = getEditableElement(blockElement, focusRequest);
      if (!editable) return;
       if (typeof focusRequest.caretOffset === 'number') {
        setCaretByCharacterOffset(editable, focusRequest.caretOffset);
        return;
      }
      setCaret(editable, focusRequest.position || 'end');
    });
  }

  function render(){
    if (window.EditorCore && typeof EditorCore.renderTree === 'function'){
      EditorCore.renderTree(blocks, canvas);
      attachBlockHandlers();
      reflectSelection();
      applyPendingFocus();
      return;
    }
    canvas.innerHTML = '';
    blocks.forEach((block) => {
      const element = document.createElement('div');
      element.className = 'pe-block';
      element.dataset.id = block.id;
      element.innerText = `${block.type} - ${block.id}`;
      element.style.padding = '8px';
      element.style.border = '1px solid #eee';
      element.style.marginBottom = '8px';
      element.addEventListener('click', () => selectBlock(block.id));
      canvas.appendChild(element);
    });
    reflectSelection();
    applyPendingFocus();
  }

  function scheduleWriteback(key, callback){
    const existing = writebackTimers.get(key);
    if (existing) window.clearTimeout(existing);
    const timeoutId = window.setTimeout(() => {
      writebackTimers.delete(key);
      callback();
    }, 150);
    writebackTimers.set(key, timeoutId);
  }

  function setBlockAttrs(blockId, patch){
    if (!blockId) return;
    if (window.EditorCore && typeof EditorCore.setBlockAttrs === 'function') {
      EditorCore.setBlockAttrs(blockId, patch);
      return;
    }
    const match = findBlockEntry(blockId);
    if (!match) return;
    match.block.attrs = Object.assign({}, match.block.attrs || {}, patch || {});
    render();
  }

  function setBlockAttrsAndRestoreFocus(blockId, patch, focusOptions){
    if (focusOptions && focusOptions.blockId) queueFocus(focusOptions.blockId, focusOptions);
    setBlockAttrs(blockId, patch);
  }

  function commitBlocks(nextBlocks, nextSelectedId, focusOptions){
    blocks = nextBlocks;
    if (window.EditorCore && typeof EditorCore.setBlocks === 'function') {
      EditorCore.setBlocks(nextBlocks);
    } else {
      render();
      if (window.EditorCore) EditorCore.emit('change', nextBlocks);
    }

    if (nextSelectedId !== undefined) {
      selectedId = nextSelectedId;
      if (window.EditorCore && typeof EditorCore.selectBlockById === 'function') {
        EditorCore.selectBlockById(nextSelectedId);
      } else {
        reflectSelection();
      }
    }

    if (focusOptions && focusOptions.blockId) {
      queueFocus(focusOptions.blockId, focusOptions);
    }
  }

  function selectBlock(id, options){
    selectedId = id || null;
    selectedIds = id ? (options && options.append
      ? Array.from(new Set((selectedIds && selectedIds.length ? selectedIds : []).concat(id)))
      : [id])
      : [];
    reflectSelection();
    if (window.EditorCore && typeof EditorCore.selectBlockById === 'function') {
      EditorCore.selectBlockById(selectedId, options);
    }
  }

  function getContainerForInsert(containerBlockId) {
    if (!containerBlockId) return { list: blocks, owner: null };
    const containerMatch = findBlockEntry(containerBlockId);
    if (!containerMatch) return { list: blocks, owner: null };
    containerMatch.block.attrs = Object.assign({}, containerMatch.block.attrs || {});
    containerMatch.block.attrs.children = Array.isArray(containerMatch.block.attrs.children) ? containerMatch.block.attrs.children : [];
    return { list: containerMatch.block.attrs.children, owner: containerMatch.block };
  }

  function insertBlockIntoTree(sourceBlocks, newBlock, afterId, containerBlockId){
    const nextBlocks = sourceBlocks.slice();
    blocks = nextBlocks;
    const container = getContainerForInsert(containerBlockId);
    const targetList = container.list;
    let insertAt = targetList.length;
    if (afterId) {
      const afterMatch = findBlockEntry(afterId, nextBlocks);
      if (afterMatch && afterMatch.list === targetList) {
        insertAt = afterMatch.index + 1;
      }
    }
    targetList.splice(insertAt, 0, newBlock);
    return nextBlocks;
  }

  function getEditableValue(block, editable){
    if (!block || !editable) return '';
    if (block.type === 'paragraph' || block.type === 'heading') return editable.innerHTML;
    if (block.type === 'list') return editable.innerHTML;
    return editable.textContent || '';
  }

  function getPlainTextValue(block, editable){
    if (!block || !editable) return '';
    if (block.type === 'paragraph' || block.type === 'heading') return editable.textContent || '';
    return editable.textContent || '';
  }

  function isBlankRichText(value){
    const normalized = String(value || '')
      .replace(/<br\s*\/?>/gi, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .trim();
    return normalized.length === 0;
  }

  function getListItemsFromDom(blockElement){
    const blockId = getBlockIdFromElement(blockElement);
    const block = getBlockById(blockId);
    return normalizeListItems(block && block.attrs ? block.attrs.items : []);
  }

  function escapeHtml(value){
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function sanitizeRichText(html){
    const template = document.createElement('template');
    template.innerHTML = html || '';
    const allowed = new Set(['A', 'B', 'BR', 'CODE', 'EM', 'I', 'STRONG']);

    function sanitizeNode(node){
      if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent || '');
      if (node.nodeType !== Node.ELEMENT_NODE) return document.createDocumentFragment();

      const tagName = node.tagName.toUpperCase();
      const fragment = document.createDocumentFragment();
      Array.from(node.childNodes).forEach((child) => {
        fragment.appendChild(sanitizeNode(child));
      });

      if (!allowed.has(tagName)) return fragment;

      const element = document.createElement(tagName.toLowerCase());
      if (tagName === 'A') {
        const href = node.getAttribute('href') || '';
        if (href) {
          element.setAttribute('href', href);
          element.setAttribute('target', '_blank');
          element.setAttribute('rel', 'noreferrer noopener');
        }
      }
      element.appendChild(fragment);
      return element;
    }

    const wrapper = document.createElement('div');
    Array.from(template.content.childNodes).forEach((child) => {
      wrapper.appendChild(sanitizeNode(child));
    });
    return wrapper.innerHTML;
  }

  function convertPlainTextToHtml(text){
    return escapeHtml(text).replace(/\r\n?/g, '\n').replace(/\n/g, '<br>');
  }

  function insertHtmlAtSelection(html){
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const template = document.createElement('template');
    template.innerHTML = html;
    const fragment = template.content;
    const lastNode = fragment.lastChild;
    range.insertNode(fragment);
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return true;
  }

  function replaceSelectionWithHtml(html){
    if (!insertHtmlAtSelection(html)) {
      document.execCommand('insertHTML', false, html);
    }
  }

  function getSelectedTextBlockPayload(block){
    if (!block) return null;
    if (block.type === 'paragraph' || block.type === 'heading') {
      return {
        html: block.attrs && block.attrs.text ? block.attrs.text : '',
        text: stripHtml(block.attrs && block.attrs.text ? block.attrs.text : '')
      };
    }
    if (block.type === 'list') {
      const items = normalizeListItems(block.attrs && Array.isArray(block.attrs.items) ? block.attrs.items : []);
      return {
        items,
        html: items.map((item) => item.content || '').join('<br>'),
        text: flattenListPaths(items).map((path) => {
          const item = getListItemAtPath(items, path);
          return stripHtml(item && item.content ? item.content : '');
        }).join('\n')
      };
    }
    if (block.type === 'code') {
      return {
        html: convertPlainTextToHtml(block.attrs && block.attrs.code ? block.attrs.code : ''),
        text: block.attrs && block.attrs.code ? block.attrs.code : ''
      };
    }
    return null;
  }

  function stripHtml(value){
    const temp = document.createElement('div');
    temp.innerHTML = value || '';
    return temp.textContent || '';
  }

  function getBlockTypographyStyle(block) {
    if (!block || !block.attrs || !block.attrs.style) return {};
    return block.type === 'list' && block.attrs.style.typography
      ? Object.assign({}, block.attrs.style.typography)
      : Object.assign({}, block.attrs.style);
  }

  function transformBlock(blockId, nextType){
    const block = getBlockById(blockId);
    const match = findBlockEntry(blockId);
    const index = match ? match.index : -1;
    const targetList = match ? match.list : blocks;
    if (!block || index === -1 || !nextType || block.type === nextType) return;

    if (block.type === 'gallery' && nextType === 'image') {
      const images = normalizeGalleryImages(block.attrs && block.attrs.images ? block.attrs.images : []);
      const nextBlocks = blocks.slice();
      const imageBlocks = images.map((image) => {
        const nextBlock = createDefaultBlock('image', {
          src: image.src || '',
          alt: image.alt || '',
          caption: image.caption || '',
          align: block.attrs && block.attrs.style && block.attrs.style.layout && block.attrs.style.layout !== 'default'
            ? block.attrs.style.layout
            : 'wide',
          style: {
            radius: block.attrs && block.attrs.style && block.attrs.style.border ? block.attrs.style.border.radius || '' : '',
            border: block.attrs && block.attrs.style && block.attrs.style.border
              ? `${block.attrs.style.border.width || '0px'} solid ${block.attrs.style.border.color || '#d1d5db'}`
              : ''
          }
        });
        if (!nextBlock.id) nextBlock.id = EditorCore.createId('b');
        return nextBlock;
      });
      if (!imageBlocks.length) imageBlocks.push(createDefaultBlock('image', {}));
      targetList.splice(index, 1, ...imageBlocks);
      commitBlocks(nextBlocks, imageBlocks[0].id, { blockId: imageBlocks[0].id, position: 'start' });
      return;
    }

    if (block.type === 'image' && nextType === 'gallery') {
      const selectedImageIds = (window.EditorCore && typeof EditorCore.getSelectedBlockIds === 'function'
        ? EditorCore.getSelectedBlockIds()
        : [blockId])
        .filter((id) => {
          const selectedBlock = getBlockById(id);
          return selectedBlock && selectedBlock.type === 'image';
        });
      if (selectedImageIds.length < 2) return;
      const selectedImageBlocks = blocks.filter((entry) => selectedImageIds.includes(entry.id) && entry.type === 'image');
      const galleryBlock = createDefaultBlock('gallery', {
        images: selectedImageBlocks.map((entry) => ({
          src: entry.attrs && entry.attrs.src ? entry.attrs.src : '',
          alt: entry.attrs && entry.attrs.alt ? entry.attrs.alt : '',
          caption: entry.attrs && entry.attrs.caption ? entry.attrs.caption : ''
        }))
      });
      if (!galleryBlock.id) galleryBlock.id = EditorCore.createId('b');
      const firstIndex = blocks.findIndex((entry) => entry.id === selectedImageBlocks[0].id);
      const nextBlocks = blocks.filter((entry) => !selectedImageIds.includes(entry.id));
      nextBlocks.splice(firstIndex, 0, galleryBlock);
      commitBlocks(nextBlocks, galleryBlock.id, { blockId: galleryBlock.id, position: 'start' });
      EditorCore.emit('gallery:selection', { blockId: galleryBlock.id, imageId: null });
      return;
    }

    const payload = getSelectedTextBlockPayload(block);
    if (!payload) return;

    const nextBlocks = blocks.slice();
    if (nextType === 'paragraph') {
      if (block.type === 'list') {
        const paragraphs = flattenListPaths(payload.items || []).map((path) => {
          const item = getListItemAtPath(payload.items || [], path);
          return createDefaultBlock('paragraph', {
            text: item && item.content ? item.content : '',
            align: block.attrs && block.attrs.align ? block.attrs.align : 'left',
            style: Object.assign({}, block.attrs && block.attrs.style && block.attrs.style.typography ? block.attrs.style.typography : {})
          });
        });
        if (!paragraphs.length) paragraphs.push(createDefaultBlock('paragraph', {
          text: '',
          align: block.attrs && block.attrs.align ? block.attrs.align : 'left',
          style: Object.assign({}, block.attrs && block.attrs.style && block.attrs.style.typography ? block.attrs.style.typography : {})
        }));
        paragraphs.forEach((paragraph) => {
          if (!paragraph.id) paragraph.id = EditorCore.createId('b');
        });
        targetList.splice(index, 1, ...paragraphs);
        commitBlocks(nextBlocks, paragraphs[0].id, { blockId: paragraphs[0].id, position: 'start' });
        return;
      }
      const nextBlock = createDefaultBlock('paragraph', {
        text: payload.html,
        align: block.attrs && block.attrs.align ? block.attrs.align : 'left',
        style: Object.assign({}, block.attrs && block.attrs.style ? block.attrs.style : {})
      });
      nextBlock.id = block.id;
      targetList[index] = nextBlock;
      commitBlocks(nextBlocks, nextBlock.id, { blockId: nextBlock.id, position: 'end' });
      return;
    }

    if (nextType === 'heading') {
      const nextBlock = createDefaultBlock('heading', {
        text: payload.html || convertPlainTextToHtml(payload.text),
        align: block.attrs && block.attrs.align ? block.attrs.align : 'left',
        level: block.type === 'heading' && block.attrs && block.attrs.level ? block.attrs.level : 2,
        style: getBlockTypographyStyle(block)
      });
      nextBlock.id = block.id;
      targetList[index] = nextBlock;
      commitBlocks(nextBlocks, nextBlock.id, { blockId: nextBlock.id, position: 'end' });
      return;
    }

    if (nextType === 'list') {
      const items = block.type === 'list'
        ? (payload.items || [''])
        : String(payload.text || '').split(/\r?\n/).filter((line) => line.trim().length > 0);
      const nextBlock = createDefaultBlock('list', {
        ordered: false,
        items: items.length
          ? (block.type === 'list'
            ? items
            : items.map((item) => ({ content: sanitizeRichText(item), children: [] })))
          : [{ content: '', children: [] }],
        align: block.attrs && block.attrs.align ? block.attrs.align : 'left',
        style: createListStyle({
          typography: getBlockTypographyStyle(block)
        })
      });
      nextBlock.id = block.id;
      targetList[index] = nextBlock;
      commitBlocks(nextBlocks, nextBlock.id, { blockId: nextBlock.id, itemPath: '0', position: 'start' });
      return;
    }

    if (nextType === 'code') {
      const nextBlock = createDefaultBlock('code', {
        code: payload.text,
        language: block.type === 'code' && block.attrs ? block.attrs.language || '' : '',
        style: getBlockTypographyStyle(block)
      });
      nextBlock.id = block.id;
      targetList[index] = nextBlock;
      commitBlocks(nextBlocks, nextBlock.id, { blockId: nextBlock.id, position: 'end' });
    }
  }

  function splitTextBlock(blockId, editable){
    const block = getBlockById(blockId);
    const match = findBlockEntry(blockId);
    const index = match ? match.index : -1;
    const targetList = match ? match.list : blocks;
    if (!block || index === -1) return;

    const sourceText = getPlainTextValue(block, editable);
    const offset = getCaretCharacterOffsetWithin(editable);
    const before = sourceText.slice(0, offset);
    const after = sourceText.slice(offset);
    const nextBlocks = blocks.slice();

    targetList[index] = Object.assign({}, block, {
      attrs: Object.assign({}, block.attrs || {}, { text: before })
    });

    const newBlock = createDefaultBlock('paragraph', { text: after });
    if (!newBlock.id) {
      newBlock.id = (window.EditorCore && typeof EditorCore.createId === 'function')
        ? EditorCore.createId('b')
        : ('b-' + Math.random().toString(36).slice(2, 9));
    }
    targetList.splice(index + 1, 0, newBlock);
    commitBlocks(nextBlocks, newBlock.id, { blockId: newBlock.id, position: 'start' });
  }

  function mergeTextBlockWithPrevious(blockId){
    const match = findBlockEntry(blockId);
    const index = match ? match.index : -1;
    const targetList = match ? match.list : blocks;
    if (index <= 0) return false;

    const current = targetList[index];
    const previous = targetList[index - 1];
    if (!current || !previous) return false;
    if (!MERGEABLE_TEXT_TYPES.has(current.type) || !MERGEABLE_TEXT_TYPES.has(previous.type)) return false;

    const mergedText = `${previous.attrs && previous.attrs.text ? previous.attrs.text : ''}${current.attrs && current.attrs.text ? current.attrs.text : ''}`;
    const nextBlocks = blocks.slice();
    targetList[index - 1] = Object.assign({}, previous, {
      attrs: Object.assign({}, previous.attrs || {}, { text: mergedText })
    });
    targetList.splice(index, 1);
    commitBlocks(nextBlocks, previous.id, { blockId: previous.id, position: 'end' });
    return true;
  }

  function updateListBlockItems(block, nextItems, focusOptions) {
    const match = findBlockEntry(block.id);
    const blockIndex = match ? match.index : -1;
    const targetList = match ? match.list : blocks;
    if (blockIndex === -1) return;
    const nextBlocks = blocks.slice();
    targetList[blockIndex] = Object.assign({}, block, {
      attrs: Object.assign({}, block.attrs || {}, { items: normalizeListItems(nextItems) })
    });
    commitBlocks(nextBlocks, block.id, Object.assign({ blockId: block.id }, focusOptions || {}));
  }

  function insertListItem(blockId, itemPath){
    const block = getBlockById(blockId);
    if (!block) return;
    const result = insertListItemAfterPath(block.attrs && block.attrs.items ? block.attrs.items : [], itemPath, {
      content: '',
      children: []
    });
    updateListBlockItems(block, result.items, { itemPath: serializeItemPath(result.focusPath), position: 'start' });
  }

  function exitListToParagraph(blockId, itemPath){
    const block = getBlockById(blockId);
    const match = findBlockEntry(blockId);
    const index = match ? match.index : -1;
    const targetList = match ? match.list : blocks;
    if (!block || index === -1) return;

    const removal = removeListItemAtPath(block.attrs && block.attrs.items ? block.attrs.items : [], itemPath);
    const remainingItems = normalizeListItems(removal.items, { allowEmpty: true });

    const paragraphBlock = createDefaultBlock('paragraph', { text: '' });
    if (!paragraphBlock.id) {
      paragraphBlock.id = (window.EditorCore && typeof EditorCore.createId === 'function')
        ? EditorCore.createId('b')
        : ('b-' + Math.random().toString(36).slice(2, 9));
    }

    const nextBlocks = blocks.slice();
    if (remainingItems.length > 0) {
      targetList[index] = Object.assign({}, block, {
        attrs: Object.assign({}, block.attrs || {}, { items: remainingItems })
      });
      targetList.splice(index + 1, 0, paragraphBlock);
    } else {
      targetList.splice(index, 1, paragraphBlock);
    }

    commitBlocks(nextBlocks, paragraphBlock.id, { blockId: paragraphBlock.id, position: 'start' });
  }

  function transformEmptyListToParagraph(blockId) {
    const block = getBlockById(blockId);
    const match = findBlockEntry(blockId);
    const index = match ? match.index : -1;
    const targetList = match ? match.list : blocks;
    if (!block || index === -1) return;
    const paragraphBlock = createDefaultBlock('paragraph', { text: '' });
    paragraphBlock.id = block.id;
    const nextBlocks = blocks.slice();
    targetList[index] = paragraphBlock;
    commitBlocks(nextBlocks, paragraphBlock.id, { blockId: paragraphBlock.id, position: 'start' });
  }

  function attachTextBlockHandlers(blockElement, block, editable){
    editable.addEventListener('focus', () => selectBlock(block.id));
    editable.addEventListener('input', () => {
      if (RICH_TEXT_TYPES.has(block.type)) {
        const sanitized = sanitizeRichText(editable.innerHTML);
        if (sanitized !== editable.innerHTML) editable.innerHTML = sanitized;
      }
      scheduleWriteback(`${block.id}:text`, () => {
        const latestBlock = getBlockById(block.id);
        const latestElement = getBlockElement(block.id);
        const latestEditable = getEditableElement(latestElement);
        if (!latestBlock || !latestEditable) return;
        const field = latestBlock.type === 'code' ? 'code' : 'text';
        const value = getEditableValue(latestBlock, latestEditable);
        const caretOffset = getCaretCharacterOffsetWithin(latestEditable);
        setBlockAttrsAndRestoreFocus(block.id, { [field]: value }, {
          blockId: block.id,
          caretOffset
        });
      });
    });

    if (RICH_TEXT_TYPES.has(block.type)) {
      editable.addEventListener('paste', (event) => {
        event.preventDefault();
        const plain = event.clipboardData ? event.clipboardData.getData('text/plain') : '';
        const rich = event.clipboardData ? event.clipboardData.getData('text/html') : '';
        const html = rich ? sanitizeRichText(rich) : convertPlainTextToHtml(plain);
        replaceSelectionWithHtml(html);
        editable.dispatchEvent(new InputEvent('input', { bubbles: true }));
      });
    }

    editable.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey && TEXT_BLOCK_TYPES.has(block.type)) {
        event.preventDefault();
        splitTextBlock(block.id, editable);
        return;
      }

      if (event.key === 'Backspace' && TEXT_BLOCK_TYPES.has(block.type)) {
        const caretOffset = getCaretCharacterOffsetWithin(editable);
        if (caretOffset === 0 && mergeTextBlockWithPrevious(block.id)) {
          event.preventDefault();
        }
      }
    });
  }

  function attachListHandlers(blockElement, block){
    let draggedItemPath = null;
    const items = getListItemElements(blockElement);

    function clearDragState() {
      blockElement.querySelectorAll('.pe-block-list-item').forEach((entry) => {
        entry.classList.remove('is-drop-before', 'is-drop-after', 'is-drop-child', 'is-dragging');
      });
    }

    items.forEach((item) => {
      item.addEventListener('focus', () => selectBlock(block.id));
      item.addEventListener('input', () => {
        const sanitized = sanitizeRichText(item.innerHTML);
        if (sanitized !== item.innerHTML) item.innerHTML = sanitized;
        scheduleWriteback(`${block.id}:${item.dataset.itemPath}:items`, () => {
          const latestBlock = getBlockById(block.id);
          if (!latestBlock) return;
          const itemPath = parseItemPath(item.dataset.itemPath);
          const caretOffset = getCaretCharacterOffsetWithin(item);
          const nextItems = replaceListItemContent(latestBlock.attrs && latestBlock.attrs.items ? latestBlock.attrs.items : [], itemPath, item.innerHTML);
          setBlockAttrsAndRestoreFocus(block.id, { items: nextItems }, {
            blockId: block.id,
            itemPath: serializeItemPath(itemPath),
            caretOffset
          });
        });
      });

      item.addEventListener('paste', (event) => {
        event.preventDefault();
        const plain = event.clipboardData ? event.clipboardData.getData('text/plain') : '';
        const rich = event.clipboardData ? event.clipboardData.getData('text/html') : '';
        const html = rich ? sanitizeRichText(rich) : convertPlainTextToHtml(plain);
        replaceSelectionWithHtml(html);
        item.dispatchEvent(new InputEvent('input', { bubbles: true }));
      });

      item.addEventListener('keydown', (event) => {
        const itemPath = parseItemPath(item.dataset.itemPath);
        const latestBlock = getBlockById(block.id);
        if (!latestBlock) return;
        const latestItems = latestBlock.attrs && latestBlock.attrs.items ? latestBlock.attrs.items : [];

        if (event.key === 'Tab') {
          event.preventDefault();
          const result = event.shiftKey ? outdentListItem(latestItems, itemPath) : indentListItem(latestItems, itemPath);
          updateListBlockItems(latestBlock, result.items, { itemPath: serializeItemPath(result.focusPath), position: 'end' });
          return;
        }

        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          if (isBlankRichText(item.innerHTML)) {
            exitListToParagraph(block.id, itemPath);
            return;
          }
          insertListItem(block.id, itemPath);
          return;
        }

        if (event.key === 'Backspace' && getCaretCharacterOffsetWithin(item) === 0) {
          if (isBlankRichText(item.innerHTML) && item.dataset.itemPath === '0') {
            event.preventDefault();
            transformEmptyListToParagraph(block.id);
            return;
          }
          const result = mergeListItemWithPrevious(latestItems, itemPath);
          if (result.merged) {
            event.preventDefault();
            updateListBlockItems(latestBlock, result.items, {
              itemPath: serializeItemPath(result.focusPath),
              caretOffset: result.caretOffset
            });
          }
          return;
        }

        if (event.key === 'ArrowUp' && getCaretCharacterOffsetWithin(item) === 0) {
          const previousPath = getPreviousVisibleListPath(latestItems, itemPath);
          if (previousPath) {
            event.preventDefault();
            queueFocus(block.id, { blockId: block.id, itemPath: serializeItemPath(previousPath), position: 'end' });
            render();
          }
          return;
        }

        if (event.key === 'ArrowDown' && getCaretCharacterOffsetWithin(item) === (item.textContent || '').length) {
          const nextPath = getNextVisibleListPath(latestItems, itemPath);
          if (nextPath) {
            event.preventDefault();
            queueFocus(block.id, { blockId: block.id, itemPath: serializeItemPath(nextPath), position: 'start' });
            render();
          }
        }
      });

      const li = item.closest('.pe-block-list-item');
      if (!li) return;

      li.addEventListener('dragstart', (event) => {
        draggedItemPath = li.dataset.itemPath || null;
        li.classList.add('is-dragging');
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/list-item-path', draggedItemPath || '');
        }
      });

      li.addEventListener('dragend', () => {
        draggedItemPath = null;
        clearDragState();
      });

      li.addEventListener('dragover', (event) => {
        if (!draggedItemPath) return;
        event.preventDefault();
        clearDragState();
        const rect = li.getBoundingClientRect();
        const offsetY = event.clientY - rect.top;
        const placement = offsetY < rect.height / 3 ? 'before' : (offsetY > rect.height * 0.66 ? 'after' : 'child');
        li.classList.add(`is-drop-${placement}`);
      });

      li.addEventListener('drop', (event) => {
        if (!draggedItemPath) return;
        event.preventDefault();
        clearDragState();
        const latestBlock = getBlockById(block.id);
        if (!latestBlock) return;
        const rect = li.getBoundingClientRect();
        const offsetY = event.clientY - rect.top;
        const placement = offsetY < rect.height / 3 ? 'before' : (offsetY > rect.height * 0.66 ? 'after' : 'child');
        const result = moveListItem(latestBlock.attrs && latestBlock.attrs.items ? latestBlock.attrs.items : [], parseItemPath(draggedItemPath), parseItemPath(li.dataset.itemPath), placement);
        updateListBlockItems(latestBlock, result.items, { itemPath: serializeItemPath(result.focusPath), position: 'end' });
      });
    });
  }

  function attachGalleryHandlers(blockElement, block) {
    let draggedIndex = null;

    function openGalleryLightbox(image) {
      if (!image || !image.src) return;
      const overlay = document.createElement('div');
      overlay.className = 'pe-gallery-lightbox-overlay';
      Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(15, 23, 42, 0.82)',
        zIndex: '10000'
      });

      const dialog = document.createElement('div');
      Object.assign(dialog.style, {
        position: 'relative',
        maxWidth: 'min(96vw, 1120px)',
        maxHeight: '92vh',
        display: 'grid',
        gap: '12px'
      });

      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.textContent = 'Close';
      closeButton.setAttribute('aria-label', 'Close gallery lightbox');
      Object.assign(closeButton.style, {
        justifySelf: 'end',
        padding: '8px 12px',
        border: '0',
        borderRadius: '999px',
        background: '#ffffff',
        color: '#111827',
        cursor: 'pointer'
      });

      const img = document.createElement('img');
      img.src = image.src;
      img.alt = image.alt || image.caption || 'Gallery image preview';
      Object.assign(img.style, {
        display: 'block',
        maxWidth: '100%',
        maxHeight: 'calc(92vh - 56px)',
        borderRadius: '12px',
        background: '#ffffff'
      });

      const cleanup = () => {
        document.removeEventListener('keydown', onKeyDown, true);
        overlay.remove();
      };

      const onKeyDown = (event) => {
        if (event.key === 'Escape') cleanup();
      };

      closeButton.addEventListener('click', cleanup);
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) cleanup();
      });
      dialog.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      dialog.append(closeButton, img);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      document.addEventListener('keydown', onKeyDown, true);
      closeButton.focus();
    }

    function clearDragState() {
      blockElement.querySelectorAll('.pe-gallery-item').forEach((item) => {
        item.classList.remove('is-drop-before', 'is-drop-after', 'is-selected');
      });
    }

    function syncSelectedImageState() {
      const selectedImageId = selectedGallerySelection && selectedGallerySelection.blockId === block.id ? selectedGallerySelection.imageId : null;
      blockElement.querySelectorAll('.pe-gallery-item').forEach((item) => {
        item.classList.toggle('is-selected', !!selectedImageId && item.dataset.imageId === selectedImageId);
      });
    }

    blockElement.querySelectorAll('.pe-gallery-item').forEach((item) => {
      const imageId = item.dataset.imageId;
      const index = Number(item.dataset.imageIndex);
      const caption = item.querySelector('.pe-gallery-caption[data-caption="true"]');
      const removeButton = item.querySelector('.pe-gallery-remove');
      const lightboxTrigger = item.querySelector('.pe-gallery-lightbox-trigger');

      item.addEventListener('click', (event) => {
        event.stopPropagation();
        selectBlock(block.id);
        EditorCore.emit('gallery:selection', { blockId: block.id, imageId });
        syncSelectedImageState();
      });

      if (caption) {
        caption.addEventListener('focus', () => {
          selectBlock(block.id);
          EditorCore.emit('gallery:selection', { blockId: block.id, imageId });
          syncSelectedImageState();
        });
        caption.addEventListener('input', () => {
          scheduleWriteback(`${block.id}:${imageId}:caption`, () => {
            const latestBlock = getBlockById(block.id);
            if (!latestBlock) return;
            const nextImages = updateGalleryImageById(latestBlock.attrs && latestBlock.attrs.images ? latestBlock.attrs.images : [], imageId, () => ({
              caption: caption.textContent || ''
            }));
            setBlockAttrs(block.id, { images: nextImages });
            EditorCore.emit('gallery:selection', { blockId: block.id, imageId });
          });
        });
      }

      if (removeButton) {
        removeButton.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          const latestBlock = getBlockById(block.id);
          if (!latestBlock) return;
          const nextImages = normalizeGalleryImages(latestBlock.attrs && latestBlock.attrs.images ? latestBlock.attrs.images : []).filter((image) => image.id !== imageId);
          setBlockAttrs(block.id, { images: nextImages });
          EditorCore.emit('gallery:selection', { blockId: block.id, imageId: nextImages[0] ? nextImages[0].id : null });
        });
      }

      const mediaLink = item.querySelector('.pe-gallery-media-link');
      if (mediaLink) {
        mediaLink.addEventListener('click', (event) => {
          event.preventDefault();
        });
      }

      if (lightboxTrigger) {
        lightboxTrigger.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          const latestBlock = getBlockById(block.id);
          if (!latestBlock) return;
          const latestImage = normalizeGalleryImages(latestBlock.attrs && latestBlock.attrs.images ? latestBlock.attrs.images : [])
            .find((entry) => entry.id === imageId);
          selectBlock(block.id);
          EditorCore.emit('gallery:selection', { blockId: block.id, imageId });
          syncSelectedImageState();
          openGalleryLightbox(latestImage);
        });
      }

      item.addEventListener('dragstart', (event) => {
        draggedIndex = index;
        item.classList.add('is-selected');
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/gallery-index', String(index));
        }
      });

      item.addEventListener('dragend', () => {
        draggedIndex = null;
        clearDragState();
        syncSelectedImageState();
      });

      item.addEventListener('dragover', (event) => {
        if (draggedIndex === null) return;
        event.preventDefault();
        clearDragState();
        const rect = item.getBoundingClientRect();
        const placement = event.clientX < rect.left + (rect.width / 2) ? 'before' : 'after';
        item.classList.add(`is-drop-${placement}`);
      });

      item.addEventListener('drop', (event) => {
        if (draggedIndex === null) return;
        event.preventDefault();
        const rect = item.getBoundingClientRect();
        const placement = event.clientX < rect.left + (rect.width / 2) ? 'before' : 'after';
        const latestBlock = getBlockById(block.id);
        if (!latestBlock) return;
        const targetIndex = placement === 'before' ? index : index + 1;
        const normalizedImages = normalizeGalleryImages(latestBlock.attrs && latestBlock.attrs.images ? latestBlock.attrs.images : []);
        const adjustedIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
        const nextImages = moveGalleryImage(normalizedImages, draggedIndex, Math.max(0, Math.min(normalizedImages.length - 1, adjustedIndex)));
        setBlockAttrs(block.id, { images: nextImages });
        const movedImage = nextImages[Math.max(0, Math.min(nextImages.length - 1, adjustedIndex))];
        EditorCore.emit('gallery:selection', { blockId: block.id, imageId: movedImage ? movedImage.id : null });
        draggedIndex = null;
      });
    });

    blockElement.addEventListener('click', (event) => {
      if (event.target.closest('.pe-gallery-item')) return;
      selectBlock(block.id, { append: event.ctrlKey || event.metaKey });
      EditorCore.emit('gallery:selection', { blockId: block.id, imageId: null });
      syncSelectedImageState();
    });

    syncSelectedImageState();
  }

  function attachBlockHandlers(scope){
    const rootScope = scope || canvas;
    if (!rootScope) return;
    const elements = rootScope.querySelectorAll('[data-block-id], [data-id]');
    elements.forEach((element) => {
      const blockId = getBlockIdFromElement(element);
      const block = getBlockById(blockId);
      if (!block) return;
      const defs = window.EDITOR_BLOCK_DEFINITIONS || {};
      const def = defs[block.type];

      element.addEventListener('click', (event) => selectBlock(blockId, { append: event.ctrlKey || event.metaKey }));

      if (def && typeof def.edit === 'function') {
        const handled = def.edit({
          block,
          blockElement: element,
          editable: getEditableElement(element),
          EditorCore: window.EditorCore,
          helpers: {
            attachTextBlockHandlers,
            attachListHandlers,
            attachGalleryHandlers,
            getEditableElement,
            selectBlock
          }
        });
        if (handled !== false) return;
      }

      if (block.type === 'list') {
        attachListHandlers(element, block);
        return;
      }

      if (block.type === 'gallery') {
        attachGalleryHandlers(element, block);
        return;
      }

      const editable = getEditableElement(element);
      if (!editable) return;
      attachTextBlockHandlers(element, block, editable);
    });
  }

  window.EditorCanvasRuntime = Object.assign(window.EditorCanvasRuntime || {}, {
    attachBlockHandlers,
    createDefaultBlock,
    selectBlock
  });

  if (window.EditorCore){
    EditorCore.on('transform', (payload) => {
      const blockId = payload && payload.id ? payload.id : selectedId;
      const nextType = payload && payload.type ? payload.type : null;
      if (!blockId || !nextType) return;
      transformBlock(blockId, nextType);
    });

    EditorCore.on('insert', (payload) => {
      let newBlock = null;
      let afterId = null;
      let containerBlockId = null;
      if (!payload) return;
      if (payload.block) newBlock = payload.block;
      else if (payload.type) newBlock = createDefaultBlock(payload.type, payload.attrs);
      afterId = payload.afterBlockId || (EditorCore.getState && EditorCore.getState().selectedId) || null;
      containerBlockId = payload.containerBlockId || null;
      if (!newBlock) return;
      if (!newBlock.id) {
        newBlock.id = (typeof EditorCore.createId === 'function') ? EditorCore.createId('b') : ('b-'+Math.random().toString(36).slice(2,9));
      }
      const nextBlocks = insertBlockIntoTree(blocks, newBlock, afterId, containerBlockId);
      commitBlocks(nextBlocks, newBlock.id, { blockId: newBlock.id, position: 'start' });
    });

    EditorCore.on('delete', (payload) => {
      const id = typeof payload === 'string' ? payload : (payload && payload.id) ? payload.id : null;
      if (!id) return;
      const nextBlocks = blocks.slice();
      blocks = nextBlocks;
      const match = findBlockEntry(id, nextBlocks);
      if (!match) return;
      match.list.splice(match.index, 1);
      const fallback = match.list[Math.max(0, match.index - 1)] || match.list[match.index] || match.parentBlock || null;
      commitBlocks(nextBlocks, fallback ? fallback.id : null, fallback ? { blockId: fallback.id, position: 'end' } : null);
    });

    EditorCore.on('move', (payload) => {
      const id = payload && payload.id;
      const direction = payload && payload.dir;
      const nextBlocks = blocks.slice();
      blocks = nextBlocks;
      const match = findBlockEntry(id, nextBlocks);
      if (!match) return;
      const list = match.list;
      const targetIndex = direction === 'up' ? Math.max(0, match.index - 1) : Math.min(list.length - 1, match.index + 1);
      if (targetIndex === match.index) return;
      const [item] = list.splice(match.index, 1);
      list.splice(targetIndex, 0, item);
      commitBlocks(nextBlocks, id);
    });

    EditorCore.on('clear', () => {
      commitBlocks([], null);
    });

    EditorCore.on('load', (initial) => {
      if (!Array.isArray(initial)) return;
      commitBlocks(initial, initial[0] ? initial[0].id : null);
    });

    EditorCore.on('state:changed', (state) => {
      blocks = (state && state.blocks) ? state.blocks : [];
      selectedId = (state && state.selectedId !== undefined) ? state.selectedId : null;
       selectedIds = state && Array.isArray(state.selectedIds) ? state.selectedIds : (selectedId ? [selectedId] : []);
      render();
    });

    EditorCore.on('select', (block) => {
      selectedId = block && block.id ? block.id : null;
      selectedIds = selectedId ? [selectedId] : [];
      if (!block || block.type !== 'gallery' || !selectedGallerySelection || selectedGallerySelection.blockId !== selectedId) {
        selectedGallerySelection = null;
      }
      reflectSelection();
    });

    EditorCore.on('selection:changed', (selection) => {
      selectedId = selection && selection.id ? selection.id : null;
      selectedIds = selection && Array.isArray(selection.ids) ? selection.ids : (selectedId ? [selectedId] : []);
      reflectSelection();
    });

    EditorCore.on('gallery:selection', (selection) => {
      selectedGallerySelection = selection && selection.blockId ? selection : null;
      render();
    });
  }

  render();

  let insertionLine = null;
  function ensureInsertionLine(){
    if (insertionLine) return insertionLine;
    insertionLine = document.createElement('div');
    insertionLine.className = 'pe-insert-line';
    insertionLine.style.position = 'absolute';
    insertionLine.style.height = '2px';
    insertionLine.style.background = '#0a74ff';
    insertionLine.style.zIndex = '9998';
    insertionLine.style.pointerEvents = 'none';
    document.body.appendChild(insertionLine);
    return insertionLine;
  }

  function clearInsertionLine(){
    if (!insertionLine) return;
    insertionLine.style.display = 'none';
  }

  function showInsertionAtRect(rect){
    const line = ensureInsertionLine();
    line.style.left = (rect.left + window.scrollX) + 'px';
    line.style.width = rect.width + 'px';
    line.style.top = (rect.top + window.scrollY - 1) + 'px';
    line.style.display = 'block';
  }

  function computeAfterIdFromPointer(y){
    const elements = Array.from(canvas.querySelectorAll('[data-block-id], [data-id]'));
    if (!elements.length) return null;
    for (let i = 0; i < elements.length; i += 1) {
      const element = elements[i];
      const rect = element.getBoundingClientRect();
      const midpoint = rect.top + (rect.height / 2);
      if (y < midpoint) return getBlockIdFromElement(element);
    }
    return getBlockIdFromElement(elements[elements.length - 1]);
  }

  canvas.addEventListener('dragover', (event) => {
    event.preventDefault();
    const afterId = computeAfterIdFromPointer(event.clientY);
    const anchor = getBlockElement(afterId);
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const top = event.clientY < (rect.top + rect.height / 2) ? rect.top : rect.bottom;
    showInsertionAtRect({ left: rect.left, top, width: rect.width });
  });

  canvas.addEventListener('dragleave', () => {
    clearInsertionLine();
  });

  canvas.addEventListener('drop', (event) => {
    event.preventDefault();
    clearInsertionLine();
    const type = event.dataTransfer.getData('text/block-type') || event.dataTransfer.getData('text/plain');
    let attrs = null;
    try {
      const raw = event.dataTransfer.getData('application/json');
      if (raw) {
        const parsed = JSON.parse(raw);
        attrs = parsed.attrs || parsed;
      }
    } catch (error) {
      attrs = null;
    }
    if (!type || !window.EditorCore) return;
    EditorCore.emit('insert', {
      type,
      attrs: attrs || undefined,
      afterBlockId: computeAfterIdFromPointer(event.clientY)
    });
  });

  function isEditingTarget(target){
    const element = target && target.nodeType === 1 ? target : target && target.parentElement;
    return !!(element && element.closest('[contenteditable]'));
  }

  document.addEventListener('keydown', (event) => {
    if (!selectedId || isEditingTarget(event.target)) return;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      EditorCore.emit('delete', selectedId);
      return;
    }

    if (event.key === 'ArrowUp' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      EditorCore.emit('move', { id: selectedId, dir: 'up' });
      return;
    }

    if (event.key === 'ArrowDown' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      EditorCore.emit('move', { id: selectedId, dir: 'down' });
    }
  });

  function getCaretCharacterOffsetWithin(element) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }

  window.EditorCanvas = {
    getBlocks: () => (window.EditorCore && typeof EditorCore.getBlocks === 'function') ? EditorCore.getBlocks() : blocks,
    setBlocks: (nextBlocks) => {
      blocks = Array.isArray(nextBlocks) ? nextBlocks : blocks;
      if (window.EditorCore && typeof EditorCore.setBlocks === 'function') {
        EditorCore.setBlocks(blocks);
      } else {
        render();
      }
    }
  };
})();
