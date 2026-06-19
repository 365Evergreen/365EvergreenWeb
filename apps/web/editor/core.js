// Minimal editor core scaffold: event bus, renderTree placeholder, selection utilities.
(function () {
  const listeners = {};
  const state = { blocks: [], selectedId: null, selectedIds: [] };
  // page metadata (title, slug, author, status, etc.)
  state.page = { attrs: {}, _savedSnapshot: null };

  function on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  }

  function off(event, fn) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter((f) => f !== fn);
  }

  function emit(event, detail) {
    (listeners[event] || []).forEach((fn) => {
      try { fn(detail); } catch (e) { console.error(e); }
    });
  }

  function getState() {
    return JSON.parse(JSON.stringify(state));
  }

  function slugify(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function applyAutoSlug(currentAttrs, incomingAttrs) {
    const existing = Object.assign({}, currentAttrs || {});
    const next = Object.assign({}, existing, incomingAttrs || {});
    const hasIncomingTitle = Object.prototype.hasOwnProperty.call(incomingAttrs || {}, 'title');
    const hasIncomingSlug = Object.prototype.hasOwnProperty.call(incomingAttrs || {}, 'slug');
    if (hasIncomingSlug) return next;
    if (!hasIncomingTitle) return next;
    const currentSlug = existing.slug ? String(existing.slug).trim() : '';
    const currentTitleSlug = slugify(existing.title);
    if (!currentSlug || currentSlug === currentTitleSlug) {
      next.slug = slugify(next.title);
    }
    return next;
  }

  function setState(partial) {
    if (!partial) return;
    if (partial.blocks) state.blocks = Array.isArray(partial.blocks) ? partial.blocks : state.blocks;
    if (partial.selectedId !== undefined) state.selectedId = partial.selectedId;
    if (partial.selectedIds !== undefined) state.selectedIds = Array.isArray(partial.selectedIds) ? partial.selectedIds.slice() : state.selectedIds;
    // allow page to be set via setState.page
    if (partial.page) state.page = Object.assign({}, state.page || {}, partial.page);
    emit('state:changed', getState());
  }

  function getChildBlocks(block) {
    return block && block.attrs && Array.isArray(block.attrs.children) ? block.attrs.children : [];
  }

  function findBlockEntry(id, sourceBlocks) {
    const list = Array.isArray(sourceBlocks) ? sourceBlocks : state.blocks;
    for (let index = 0; index < list.length; index += 1) {
      const block = list[index];
      if (!block) continue;
      if (block.id === id) return { block, index, list };
      const childMatch = findBlockEntry(id, getChildBlocks(block));
      if (childMatch) return childMatch;
    }
    return null;
  }

  function getBlocks() { return state.blocks.slice(); }
  function setBlocks(blocks) { setState({ blocks: Array.isArray(blocks) ? blocks : [] }); }

  function getPage(){ return JSON.parse(JSON.stringify(state.page || { attrs: {} })); }

  function setPage(page){
    if(!page) return;
    const currentPage = state.page || { attrs: {} };
    const nextAttrs = applyAutoSlug(currentPage.attrs, page.attrs || {});
    state.page = Object.assign({}, currentPage, page || {}, { attrs: nextAttrs });
    emit('page:changed', getPage());
    emit('state:changed', getState());
  }

  function setPageAttrs(patch){
    if(!patch) return;
    const currentPage = state.page || { attrs: {} };
    state.page = Object.assign({}, currentPage, { attrs: applyAutoSlug(currentPage.attrs, patch) });
    state.page._savedSnapshot = state.page._savedSnapshot || null;
    state.page._dirty = true;
    emit('page:changed', getPage());
    emit('state:changed', getState());
  }

  function getSelectedBlockIds(){
    if (Array.isArray(state.selectedIds) && state.selectedIds.length) return state.selectedIds.slice();
    return state.selectedId ? [state.selectedId] : [];
  }

  function selectBlockById(id, options){
    const append = !!(options && options.append);
    if (!id) {
      state.selectedId = null;
      state.selectedIds = [];
      emit('select', null);
      emit('selection:changed', { id: null, ids: [], block: null, blocks: [] });
      return;
    }
    const existing = getSelectedBlockIds();
    const nextIds = append
      ? Array.from(new Set(existing.concat(id)))
      : [id];
    state.selectedId = id;
    state.selectedIds = nextIds;
    const block = (findBlockEntry(id, state.blocks || []) || {}).block || null;
    const blocks = nextIds.map((entryId) => (findBlockEntry(entryId, state.blocks || []) || {}).block).filter(Boolean);
    emit('select', block);
    emit('selection:changed', { id, ids: nextIds, block, blocks });
  }

  function getSelectedBlock(){
    const match = findBlockEntry(state.selectedId, state.blocks || []);
    return match ? match.block : null;
  }

  function createId(prefix){ return (prefix||'b') + '_' + Date.now() + '_' + Math.floor(Math.random()*1000); }

  function setBlockAttrs(id, patch){
    if (!id) return;
    const match = findBlockEntry(id, state.blocks || []);
    if (!match) return;
    match.block.attrs = Object.assign({}, match.block.attrs || {}, patch || {});
    state.page._dirty = true;
    emit('state:changed', getState());
  }

  function moveBlock(id, dir){
    if (!id || !dir) return;
    emit('move', { id, dir });
  }

  function deleteBlock(id){
    if (!id) return;
    emit('delete', { id });
  }

  function transformBlock(id, type){
    if (!id || !type) return;
    emit('transform', { id, type });
  }

  function reorderBlocks(id, target){
    if (!id) return;
    const match = findBlockEntry(id, state.blocks || []);
    if (!match) return;
    const list = match.list || state.blocks;
    const to = (target && typeof target.index === 'number') ? Math.max(0, Math.min(list.length - 1, target.index)) : list.length - 1;
    const [item] = list.splice(match.index, 1);
    list.splice(to, 0, item);
    emit('state:changed', getState());
  }

  function cloneBlock(b){
    if(!b) return null;
    const nb = JSON.parse(JSON.stringify(b));
    nb.id = createId('p');
    if (nb.attrs && Array.isArray(nb.attrs.children)) nb.attrs.children = nb.attrs.children.map(cloneBlock);
    return nb;
  }

  // atomic pattern insertion: insert a pattern subtree in one operation
  on('insertPattern', ({pattern, origin} = {})=>{
    const st = getState();
    const sel = st.selectedId;
    const insertIndex = sel ? (st.blocks.findIndex(b=>b.id===sel) + 1) : st.blocks.length;
    const cloned = Array.isArray(pattern) ? pattern.map(cloneBlock) : [cloneBlock(pattern)];
    const next = { ...st, blocks: [...st.blocks.slice(0,insertIndex), ...cloned, ...st.blocks.slice(insertIndex)] };
    setState(next);
    emit('pattern:inserted',{origin, inserted: cloned});
  });

  function renderTree(blocks, container, customRenderer) {
    if (!container) return;
    container.innerHTML = '';
    (blocks || []).forEach((block) => {
      let el;
      if (typeof customRenderer === 'function') {
        el = customRenderer(block);
      } else {
        const defs = window.EDITOR_BLOCK_DEFINITIONS || {};
        const def = defs[block.type];
        if (def && typeof def.render === 'function') {
          try {
            el = def.render(block);
          } catch (e) {
            console.error('Block render error for', block.type, e);
          }
        }
        if (!el) {
          el = document.createElement('div');
          el.className = 'pe-block';
          const inner = document.createElement('div');
          inner.className = 'pe-block-inner';
          inner.textContent = block.type || 'block';
          el.appendChild(inner);
        }
      }

      if (!(el instanceof Element)) {
        const wrap = document.createElement('div');
        wrap.appendChild(document.createTextNode(String(el || '')));
        el = wrap;
      }

      el.dataset.blockId = block.id || '';
      el.dataset.blockType = block.type || '';
      if (block.attrs && block.attrs.className) {
        const cls = String(block.attrs.className || '').trim();
        if (cls) el.classList.add(...cls.split(/\s+/));
      }

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        emit('select', block);
      });

      container.appendChild(el);
    });
  }

  function saveBlock(block, options) {
    if (!block) return '';
    const defs = window.EDITOR_BLOCK_DEFINITIONS || {};
    const def = defs[block.type];
    if (def && typeof def.save === 'function') {
      try {
        return def.save(block, options || {});
      } catch (e) {
        console.error('Block save error for', block.type, e);
      }
    }
    return '';
  }

  function saveBlocks(blocks, options) {
    const source = Array.isArray(blocks) ? blocks : state.blocks;
    return (source || [])
      .map((block) => saveBlock(block, options))
      .filter((value) => typeof value === 'string' && value.length > 0)
      .join('\n');
  }

  window.EditorCore = {
    on,
    off,
    emit,
    getState,
    setState,
    getBlocks,
    setBlocks,
    selectBlockById,
    getSelectedBlockIds,
    getSelectedBlock,
    createId,
    setBlockAttrs,
    moveBlock,
    deleteBlock,
    transformBlock,
    reorderBlocks,
    renderTree,
    saveBlock,
    saveBlocks
    ,getPage, setPage, setPageAttrs
  };
})();
