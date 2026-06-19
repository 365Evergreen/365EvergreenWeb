/* Inserter: category tabs, MRU, patterns, search, drag, and inline '/' inserter */
(function(){
  const el = document.getElementById('pe-block-groups');
  const search = document.getElementById('pe-inserter-search');
  const tabsEl = document.getElementById('pe-block-tabs');
  const mruEl = document.getElementById('pe-mru');
  const patternsEl = document.getElementById('pe-patterns');
  const panelEl = document.getElementById('pe-inserter-panel');
  if (!el) return;
  const collapsedEl = (function(){
    if (!panelEl) return null;
    const existing = document.getElementById('pe-inserter-collapsed');
    if (existing) return existing;
    const node = document.createElement('div');
    node.id = 'pe-inserter-collapsed';
    node.setAttribute('aria-label', 'Collapsed block inserter');
    panelEl.appendChild(node);
    return node;
  })();

  // inject small CSS patch to make tiles square and style group headers
  (function(){
    if (document.getElementById('pe-inserter-inline-styles')) return;
    const s = document.createElement('style'); s.id = 'pe-inserter-inline-styles';
    s.textContent = `
      .pe-block-grid .block-tile{ aspect-ratio: 1 / 1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:12px; box-sizing:border-box }
      .pe-block-grid .block-tile .tile-title{ margin-top:8px; text-align:center }
      .pe-group-header{ display:flex; align-items:center; gap:8px; cursor:pointer; user-select:none }
      .pe-group-header .chev{ font-size:14px; width:18px; text-align:center }
      .pe-group-content.collapsed{ display:none }
    `;
    document.head.appendChild(s);
  })();

  const defs = window.EDITOR_BLOCK_DEFINITIONS || {};
  // load icon registry synchronously so we can use registry SVGs for chevrons
  const _iconRegistry = (function(){
    try{
      const xhr = new XMLHttpRequest(); xhr.open('GET','../../design-system/icon-registry.json', false); xhr.send(null);
      if (xhr.status === 200 && xhr.responseText){
        const reg = JSON.parse(xhr.responseText);
        const map = {};
        (reg && reg.regular || []).forEach(it=>{ if (it && it.title && it.source) map[it.title]=it.source; });
        return map;
      }
    }catch(e){}
    return {};
  })();
  const blockOrder = Array.isArray(window.EDITOR_BLOCK_ORDER) ? window.EDITOR_BLOCK_ORDER : Object.keys(defs);
  const blockOrderIndex = new Map(blockOrder.map((key, index) => [key, index]));
  function getTitle(def, key){ return (def && (def.title || def.label)) || key || '' }
  const modes = ['Blocks','Patterns','Media','Forms'];
  let activeMode = 'Blocks';
  const CATEGORY_ORDER = ['Text','Media','Embed','Layout','Design','Interactive','Custom'];
  const STORAGE_LAST_CAT = 'editor.lastCategory';
  const isFormBlock = (key)=> key === 'form' || key.startsWith('field_');

  function getActiveInsertContext() {
    if (window.EditorDrawerRuntime && typeof window.EditorDrawerRuntime.getActiveContext === 'function') {
      const drawerContext = window.EditorDrawerRuntime.getActiveContext();
      if (drawerContext) return drawerContext;
    }
    if (window.EditorCoverRuntime && typeof window.EditorCoverRuntime.getActiveContext === 'function') {
      return window.EditorCoverRuntime.getActiveContext();
    }
    return null;
  }

  function getGroups(){
    const groups = {};
    Object.keys(defs).forEach(key=>{
      const def = defs[key];
      if (!def) return; // skip invalid entries
      const cat = def.category || 'Custom';
      groups[cat] = groups[cat] || [];
      groups[cat].push({key,def});
    });
    Object.keys(groups).forEach(cat=> groups[cat].sort((a,b)=> {
      const aIndex = blockOrderIndex.has(a.key) ? blockOrderIndex.get(a.key) : Number.MAX_SAFE_INTEGER;
      const bIndex = blockOrderIndex.has(b.key) ? blockOrderIndex.get(b.key) : Number.MAX_SAFE_INTEGER;
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }
      return getTitle(a.def, a.key).localeCompare(getTitle(b.def, b.key));
    }));
    return groups;
  }

  function renderTabs(groups){
    if (!tabsEl) return; // tabs are optional — if removed, skip rendering tabs
    tabsEl.innerHTML='';
    tabsEl.setAttribute('role','tablist');
    const cats = Object.keys(groups).length?Object.keys(groups):CATEGORY_ORDER;
    // include an "All" tab to show every block in the selector
    const tabs = ['All'].concat(cats);
    const last = localStorage.getItem(STORAGE_LAST_CAT) || tabs[0];
    tabs.forEach(cat=>{
      const btn = document.createElement('button');
      btn.className='pe-tab' + (cat===last? ' active' : '');
      btn.type='button';
      btn.setAttribute('role','tab');
      btn.setAttribute('aria-selected', cat===last ? 'true' : 'false');
      btn.tabIndex = cat===last ? 0 : -1;
      btn.textContent = cat;
      btn.dataset.cat = cat;
      btn.addEventListener('click',()=>{ localStorage.setItem(STORAGE_LAST_CAT,cat); render(); });
      tabsEl.appendChild(btn);
    });
  }

  function renderModes(){
    const modesEl = document.getElementById('pe-inserter-modes');
    if (!modesEl) return;
    modesEl.innerHTML = '';
    modes.forEach(m=>{
      const btn = document.createElement('button');
      btn.type='button'; btn.className = 'pe-mode' + (m===activeMode?' active':''); btn.textContent = m;
      btn.addEventListener('click', ()=>{ activeMode = m; render(); });
      modesEl.appendChild(btn);
    });
  }

  function renderMRU(){
    const activeContext = getActiveInsertContext();
    if (activeContext && activeContext.label) {
      mruEl.style.display = 'block';
      mruEl.innerHTML = '<strong>Context:</strong> ' + activeContext.label;
      return;
    }
    const mru = JSON.parse(localStorage.getItem('editor.mruBlocks')||'[]');
    if(!mru.length){ mruEl.style.display='none'; return; }
    mruEl.style.display='block';
    mruEl.innerHTML = '<strong>Recently used:</strong> ' + mru.map(k=> getTitle(defs[k],k)).join(', ');
  }

  function fuzzyMatch(text, q){
    if(!q) return true;
    q = q.replace(/\s+/g,'').toLowerCase();
    const t = text.replace(/\s+/g,'').toLowerCase();
    return t.includes(q) || q.split('').every(ch=> t.includes(ch));
  }

  function touchMRU(key){
    try{
      const arr = JSON.parse(localStorage.getItem('editor.mruBlocks')||'[]');
      const idx = arr.indexOf(key); if(idx>=0) arr.splice(idx,1);
      arr.unshift(key); if(arr.length>6) arr.length=6;
      localStorage.setItem('editor.mruBlocks', JSON.stringify(arr));
      renderMRU();
    }catch(e){}
  }

  function renderPatterns(){
    const patterns = Object.keys(defs).filter(k=> defs[k].pattern);
    if(!patterns.length || !patternsEl){
      if (patternsEl) patternsEl.style.display='none';
      return;
    }
    patternsEl.style.display='block';
    patternsEl.innerHTML = '<strong>Patterns</strong>';
    patterns.forEach(k=>{
      const def = defs[k];
      const p = document.createElement('div'); p.className='pattern-item'; p.tabIndex=0;
      p.innerHTML = `<div class="pattern-thumb">${def.patternThumb||'▦'}</div><div class="pattern-meta"><strong>${getTitle(def,k)}</strong><div class="desc">${def.description||''}</div></div>`;
      p.addEventListener('click',()=>{
        const pattern = def.createPattern ? def.createPattern() : def.patternTree;
        if(!pattern) return;
        window.EditorCore.emit('insertPattern',{pattern, origin:k});
        touchMRU(k);
      });
      patternsEl.appendChild(p);
    });
  }

  function renderCollapsedStack(items){
    if (!collapsedEl) return;
    collapsedEl.innerHTML = '';
    items.forEach(item=>{
      const b = document.createElement('button');
      b.className = 'block-tile block-tile--collapsed';
      b.type = 'button';
      b.dataset.key = item.key;
      b.title = getTitle(item.def, item.key);
         const icon = item.def.icon || '';
      b.innerHTML = `<div class="tile-icon">${icon}</div><div class="tile-title">${getTitle(item.def,item.key)}</div>`;
      b.setAttribute('aria-label', getTitle(item.def, item.key) + ' - ' + (item.def.description || ''));
      b.addEventListener('click', ()=>{
        const attrs = item.def.create ? item.def.create() : {};
        const after = (window.EditorCore && EditorCore.getState) ? EditorCore.getState().selectedId : null;
        const activeContext = getActiveInsertContext();
        window.EditorCore.emit('insert', { type: item.key, attrs, afterBlockId: after, containerBlockId: activeContext ? activeContext.blockId : null });
        touchMRU(item.key);
      });
      collapsedEl.appendChild(b);
    });
  }

  function render(){
    const q = (search && search.value||'').toLowerCase();
    el.innerHTML = '';
    const groups = getGroups();
    const collapsedItems = [];
    renderModes();
    const last = localStorage.getItem(STORAGE_LAST_CAT);
    const hasCategoryTabs = !!tabsEl;
    // if 'All' selected, showCat should be null to render every category
    const showCat = activeMode === 'Forms'
      ? null
      : (hasCategoryTabs ? ((last === 'All') ? null : (last || Object.keys(groups)[0] || 'Text')) : null);
    // Modes: Patterns shows only patterns; Media filters to Media category
    if (activeMode === 'Patterns'){
      renderPatterns();
      renderCollapsedStack([]);
      // hide tabs and MRU when showing patterns
      if(tabsEl) tabsEl.innerHTML='';
      if(mruEl) mruEl.style.display='none';
      return;
    }
    // not patterns: ensure patterns area hidden
    if(patternsEl) patternsEl.style.display='none';
    // render category tabs and MRU
    renderTabs(groups);
    renderMRU();

    // grid layout to match provided UI: sections with compact icon tiles
    Object.keys(groups).sort((a,b)=> {
      const aIndex = CATEGORY_ORDER.includes(a) ? CATEGORY_ORDER.indexOf(a) : Number.MAX_SAFE_INTEGER;
      const bIndex = CATEGORY_ORDER.includes(b) ? CATEGORY_ORDER.indexOf(b) : Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex;
    }).forEach(cat=>{
      // If Media mode, only show media category
      if(activeMode === 'Media' && cat !== 'Media') return;
      if(showCat && cat!==showCat) return;
      const visibleItems = groups[cat].filter(item=>{
        const text = (getTitle(item.def,item.key)||'') + ' ' + (item.def.description||'') + ' ' + (item.def.tags||'');
        if (activeMode === 'Forms' && !isFormBlock(item.key)) return false;
        if (q && !fuzzyMatch(text,q)) return false;
        return true;
      });
      if (!visibleItems.length) return;
      visibleItems.forEach(item=> collapsedItems.push(item));
      const header = document.createElement('div'); header.className = 'pe-group-header';
      const title = document.createElement('h4'); title.textContent = cat; title.className='pe-block-group-title pe-group-label';
      const chev = document.createElement('span'); chev.className = 'pe-block-group-chevron';
      // choose chevron svgs from the icon registry (fall back to empty)
      const iconRight = _iconRegistry['ic_fluent_chevron_right_24_regular'] || '';
      const iconDown = _iconRegistry['ic_fluent_chevron_down_24_regular'] || iconRight;
      // layout: title left, chevron right
      header.style.justifyContent = 'space-between';
      header.appendChild(title);
      header.appendChild(chev);
      // collapse state stored per-category
      const COLL_KEY = 'editor.catCollapsed.' + cat;
      const collapsed = localStorage.getItem(COLL_KEY) === '1' ? true : false;
      chev.innerHTML = collapsed ? iconRight : iconDown;
      header.addEventListener('click', ()=>{
        const cur = localStorage.getItem(COLL_KEY) === '1';
        localStorage.setItem(COLL_KEY, cur ? '0' : '1');
        // toggle content visibility
        if (grid) {
          grid.classList.toggle('collapsed');
          chev.innerHTML = grid.classList.contains('collapsed') ? iconRight : iconDown;
        }
      });
      el.appendChild(header);
      const grid = document.createElement('div'); grid.className='pe-block-grid pe-group-content';
      if (collapsed) grid.classList.add('collapsed');
      visibleItems.forEach(item=>{
        const b = document.createElement('button'); b.className='block-tile'; b.draggable=true; b.tabIndex=0;
        b.dataset.key = item.key;
           const icon = item.def.icon || '';
        b.innerHTML = `<div class="tile-icon">${icon}</div><div class="tile-title">${getTitle(item.def,item.key)}</div>`;
        b.setAttribute('aria-label', getTitle(item.def,item.key) + ' - ' + (item.def.description||''));
        b.addEventListener('click',()=>{
          const attrs = item.def.create?item.def.create():{};
          const after = (window.EditorCore && EditorCore.getState) ? EditorCore.getState().selectedId : null;
          const activeContext = getActiveInsertContext();
          window.EditorCore.emit('insert',{type:item.key,attrs, afterBlockId: after, containerBlockId: activeContext ? activeContext.blockId : null});
          touchMRU(item.key);
        });
        b.addEventListener('dragstart',(ev)=>{
          ev.dataTransfer.setData('text/block-type', item.key);
          try{ ev.dataTransfer.setData('application/json', JSON.stringify(item.def.create?item.def.create():{})); }catch(e){}
        });
        grid.appendChild(b);
      });
      el.appendChild(grid);
    });
    renderCollapsedStack(collapsedItems);
  }

  // Inline '/' inserter: lightweight popover search inside canvas
  let inlineEl = null;
  function buildInlineList(container, q){
    container.innerHTML = '';
    const groups = getGroups();
    const flat = [];
    Object.keys(groups).forEach(cat=> groups[cat].forEach(item=> flat.push(item)));
    flat.forEach(item=>{
      const text = (getTitle(item.def,item.key)||'') + ' ' + (item.def.description||'');
      if (q && !fuzzyMatch(text,q)) return;
      const node = document.createElement('div'); node.className='block-item'; node.dataset.type = item.key; node.tabIndex=0;
      node.innerHTML = `<div class="block-icon">${item.def.icon||item.def.fallbackIcon||'▦'}</div><div class="block-meta"><strong>${getTitle(item.def,item.key)}</strong><div class="desc">${item.def.description||''}</div></div>`;
      node.addEventListener('click', ()=>{ emitInsertFromType(item.key); closeInlineInserter(); });
      container.appendChild(node);
    });
  }

  function createInlineInserter(){
    if (inlineEl) return;
    inlineEl = document.createElement('div');
    inlineEl.className = 'pe-inline-inserter';
    inlineEl.style.position = 'absolute'; inlineEl.style.zIndex = 9999; inlineEl.style.minWidth = '220px'; inlineEl.style.background='#fff'; inlineEl.style.border='1px solid #ddd'; inlineEl.style.boxShadow='0 6px 18px rgba(0,0,0,0.08)'; inlineEl.style.padding='6px';
    const input = document.createElement('input'); input.type='text'; input.placeholder='Search blocks...'; input.style.width='100%'; input.style.boxSizing='border-box'; input.id='pe-inline-search';
    const list = document.createElement('div'); list.id='pe-inline-list'; list.style.maxHeight='220px'; list.style.overflow='auto'; list.style.marginTop='6px';
    inlineEl.appendChild(input); inlineEl.appendChild(list);
    document.body.appendChild(inlineEl);
    buildInlineList(list, '');

    input.addEventListener('keydown', (e)=>{
      const items = list.querySelectorAll('.block-item');
      const active = Array.from(items).findIndex(i=>i.classList.contains('active'));
      if (e.key === 'ArrowDown'){ e.preventDefault(); const next = Math.min(items.length-1, active+1); if (items[next]) { items.forEach(i=>i.classList.remove('active')); items[next].classList.add('active'); items[next].scrollIntoView({block:'nearest'}); } }
      else if (e.key === 'ArrowUp'){ e.preventDefault(); const prev = Math.max(0, active-1); if (items[prev]) { items.forEach(i=>i.classList.remove('active')); items[prev].classList.add('active'); items[prev].scrollIntoView({block:'nearest'}); } }
      else if (e.key === 'Enter'){ e.preventDefault(); const sel = list.querySelector('.block-item.active') || list.querySelector('.block-item'); if (sel) { emitInsertFromType(sel.dataset.type); closeInlineInserter(); } }
      else if (e.key === 'Escape'){ e.preventDefault(); closeInlineInserter(); }
    });

    input.addEventListener('input', (e)=>{ buildInlineList(list, e.target.value); });

    setTimeout(()=>{ document.addEventListener('click', onDocClick); }, 0);
  }

  function onDocClick(e){ if (!inlineEl) return; if (!inlineEl.contains(e.target)) closeInlineInserter(); }
  function closeInlineInserter(){ if (!inlineEl) return; document.removeEventListener('click', onDocClick); inlineEl.remove(); inlineEl = null; }

  function emitInsertFromType(type){
    // compute afterBlockId from current selection
    let afterId = null;
    const sel = window.getSelection && window.getSelection();
    if (sel && sel.anchorNode){
      const el = (sel.anchorNode.nodeType===1) ? sel.anchorNode : sel.anchorNode.parentElement;
      const blockEl = el && el.closest && el.closest('[data-block-id], [data-id]');
      if (blockEl) afterId = blockEl.getAttribute('data-block-id') || blockEl.getAttribute('data-id');
    }
    touchMRU(type);
    if (window.EditorCore && EditorCore.emit) {
      const activeContext = getActiveInsertContext();
      EditorCore.emit('insert', { type, afterBlockId: afterId, containerBlockId: activeContext ? activeContext.blockId : null });
    }
  }

  // Listen globally for '/' typed in an empty editable block
  document.addEventListener('keydown', (e)=>{
    if (e.key !== '/') return;
    const sel = window.getSelection && window.getSelection();
    if (!sel || !sel.anchorNode) return;
    const node = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
    if (!node) return;
    const blockEl = node.closest && node.closest('[data-block-id], [data-id]');
    if (!blockEl) return;
    const text = (node.textContent || '').trim();
    if (text.length > 0) return;
    e.preventDefault(); e.stopPropagation();
    if (inlineEl) closeInlineInserter();
    createInlineInserter();
    try {
      let rect = null;
      if (sel.rangeCount){ rect = sel.getRangeAt(0).getBoundingClientRect(); }
      if (!rect) rect = blockEl.getBoundingClientRect();
      if (rect){ inlineEl.style.left = (rect.left + window.scrollX) + 'px'; inlineEl.style.top = (rect.bottom + window.scrollY + 6) + 'px'; }
      const inp = inlineEl.querySelector('#pe-inline-search'); if (inp) inp.focus();
    } catch (err) { const inp = inlineEl.querySelector('#pe-inline-search'); if (inp) inp.focus(); }
  });

  // wire search input
  if (search) search.addEventListener('input', ()=> render());
  if (window.EditorCore && typeof window.EditorCore.on === 'function') {
    window.EditorCore.on('state:changed', ()=> render());
  }
  render();

  window.EditorInserter = { openInline: ()=>{ if (!inlineEl) createInlineInserter(); }, closeInline: closeInlineInserter };
})();
