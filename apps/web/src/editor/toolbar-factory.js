/* ToolbarFactory: simple per-block toolbar creator (proof-of-concept) */
(function(){
  if (window.ToolbarFactory) return;
  var TEXT_CONTEXTS = new Set(['paragraph', 'heading', 'list', 'code']);

  function getBlockDefinition(type){
    var defs = window.EDITOR_BLOCK_DEFINITIONS || {};
    return type ? defs[type] || null : null;
  }

  function normalizeToolbarControls(value){
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  function getVisibleControls(contextKey){
    try{
      var def = getBlockDefinition(contextKey);
      var toolbar = def && def.controls ? def.controls.toolbar : null;
      var actions = new Set();
      var inline = Array.isArray(toolbar) ? normalizeToolbarControls(toolbar) : normalizeToolbarControls(toolbar && toolbar.default);
      var ellipsis = toolbar && !Array.isArray(toolbar) ? normalizeToolbarControls(toolbar.ellipsis) : [];
      inline.concat(ellipsis).forEach(function(token){
        if (token === 'align') actions.add('align');
        if (token === 'replace' && contextKey === 'image') actions.add('replace-image');
        if (token === 'add' && contextKey === 'gallery') actions.add('gallery-add-images');
        if (token === 'more' || token === 'common') actions.add('delete');
      });
      if (!actions.size) actions.add('delete');
      actions.add('move-up');
      actions.add('move-down');
      return Array.from(actions);
    }catch(e){ return ['delete']; }
  }

  function getActionLabel(action){
    return String(action || '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, function(char){ return char.toUpperCase(); });
  }

  function createButton(label, action){
    var btn = document.createElement('button');
    btn.type = 'button';
    // Use design-system component classes for consistent styling
    btn.className = ['components-button','components-toolbar-button','pe-floating-toolbar__button','pe-block-toolbar__btn'].join(' ');
    btn.setAttribute('data-action', action);
    btn.setAttribute('aria-label', typeof label === 'string' ? label : action);
    // icon slot
    var ico = document.createElement('span'); ico.className = 'pe-toolbar-button__icon';
    // label (visually hidden on main toolbar; shown in overflow)
    var span = document.createElement('span'); span.className = 'pe-toolbar-button__label'; span.textContent = typeof label === 'string' ? label : action;
    btn.appendChild(ico);
    btn.appendChild(span);
    return btn;
  }

  // No non-registry fallbacks: prefer registry SVGs only.

  // load icon registry synchronously (best-effort). tries both /design-system/icon-registry.json and /icon-registry.json
  var __ICON_REGISTRY = null;
  function loadIconRegistrySync(){
    if (__ICON_REGISTRY) return __ICON_REGISTRY;
    var paths = ['/design-system/icon-registry.json','/icon-registry.json','./icon-registry.json','./design-system/icon-registry.json'];
    for(var i=0;i<paths.length;i++){
      try{
        var req = new XMLHttpRequest(); req.open('GET', paths[i], false); req.send(null);
        if (req.status === 200 && req.responseText){
          try{ var payload = JSON.parse(req.responseText); __ICON_REGISTRY = payload; return __ICON_REGISTRY; }catch(e){}
        }
      }catch(e){}
    }
    __ICON_REGISTRY = null;
    return null;
  }

  function getSvgForAction(action){
    try{
      var reg = loadIconRegistrySync();
      if (!reg) return null;
      // flatten registry into array of candidates
      var candidates = [];
      if (Array.isArray(reg.regular)) candidates = candidates.concat(reg.regular);
      if (Array.isArray(reg.filled)) candidates = candidates.concat(reg.filled);
      if (reg.blocks && typeof reg.blocks === 'object'){
        // some registries embed named maps
        Object.keys(reg.blocks).forEach(function(k){ if (reg.blocks[k] && reg.blocks[k].source) candidates.push({ title: k, source: reg.blocks[k].source }); });
      }
      var needle = String(action || '').toLowerCase();
      // try exact convention: ic_fluent_<action>_24_regular
      var exact = 'ic_fluent_' + needle.replace(/\s+/g,'_') + '_24_regular';
      for(var j=0;j<candidates.length;j++){ var t = candidates[j].title || ''; if (t.toLowerCase() === exact) return candidates[j].source; }
      // fallback: find any title that contains the action name
      for(var j=0;j<candidates.length;j++){ var t = candidates[j].title || ''; if (t.toLowerCase().indexOf(needle) !== -1) return candidates[j].source; }
      return null;
    }catch(e){ return null; }
  }

  function wireAction(btn, action, blockApi){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      try{
        if (action === 'delete'){
          if (!confirm('Delete this block?')) return;
          if (window.EditorCore) EditorCore.emit('delete', blockApi.id);
          return;
        }
        if (action === 'move-up'){
          if (window.EditorCore) EditorCore.emit('move', { id: blockApi.id, dir: 'up' });
          return;
        }
        if (action === 'move-down'){
          if (window.EditorCore) EditorCore.emit('move', { id: blockApi.id, dir: 'down' });
          return;
        }
        if (action === 'upload-image'){
          var input = document.createElement('input'); input.type = 'file'; input.accept='image/*'; input.style.display='none'; document.body.appendChild(input);
          input.addEventListener('change', function(ev){ var f = ev.target.files && ev.target.files[0]; if (!f){ input.remove(); return; } var url = URL.createObjectURL(f); if (window.EditorCore) EditorCore.setBlockAttrs(blockApi.id, { src: url }); input.remove(); });
          input.click();
          return;
        }
        if (action === 'media-library'){
          var path = window.prompt('Choose image path from library (e.g. /images/photo.jpg)');
          if (path && window.EditorCore) EditorCore.setBlockAttrs(blockApi.id, { src: path });
          return;
        }
        if (action === 'insert-image-url' || action === 'replace-image'){
          var url = window.prompt('Image URL');
          if (url && window.EditorCore) EditorCore.setBlockAttrs(blockApi.id, { src: url });
          return;
        }
        if (action === 'align'){
          var cur = blockApi.getAttrs && blockApi.getAttrs().align ? blockApi.getAttrs().align : 'left';
          var next = window.prompt('Choose alignment (left, center, right, justify)', cur) || cur;
          if (window.EditorCore) EditorCore.setBlockAttrs(blockApi.id, { align: next });
          return;
        }
        // fallback: emit generic event so consumers can react
        if (window.EditorCore) EditorCore.emit('toolbar:action', { action, id: blockApi.id });
      }catch(e){ console.error(e); }
    });
  }

  function createToolbar(hostEl, contextKey, blockApi){
    if (!hostEl) return null;
    var resolvedContext = contextKey || (blockApi && blockApi.type) || 'default';
    if (TEXT_CONTEXTS.has(resolvedContext)) {
      hostEl.innerHTML = '';
      if (hostEl.parentNode) hostEl.parentNode.removeChild(hostEl);
      return null;
    }
    hostEl.innerHTML = '';
    // Use floating toolbar container classes so visuals match the global toolbar
    hostEl.classList.add('pe-block-toolbar','components-popover__content','pe-floating-toolbar');
    // start hidden; we'll show when this block becomes selected
    hostEl.style.display = 'none';
    // store reference for debugging/cleanup
    try{ hostEl.dataset.toolbarFor = blockApi && blockApi.id ? blockApi.id : ''; }catch(e){}
    var visible = getVisibleControls(resolvedContext);
    // show only a small set of default buttons inline; others go into overflow
    var DEFAULT_INLINE = ['transform','move-up','move-down','align','bold','italic','link'];
    var inline = [];
    var overflow = [];
    visible.forEach(function(action){
      if (DEFAULT_INLINE.indexOf(action) !== -1) inline.push(action); else overflow.push(action);
    });
    // render inline buttons (only icons)
    inline.forEach(function(action){
      var label = getActionLabel(action);
      var btn = createButton(label, action);
      // set icon content (prefer SVG from registry, fall back to emoji/text)
      var ico = btn.querySelector('.pe-toolbar-button__icon');
      if (ico){
        var svg = getSvgForAction(action);
        ico.innerHTML = svg || '';
      }
      wireAction(btn, action, blockApi || {});
      hostEl.appendChild(btn);
    });
    // if there are overflow controls, render ellipsis menu
    if (overflow.length > 0) {
      var overflowBtn = document.createElement('button');
      overflowBtn.type = 'button';
      overflowBtn.className = ['components-button','components-toolbar-button','pe-floating-toolbar__button','pe-block-toolbar__btn','pe-block-toolbar__overflow'].join(' ');
      overflowBtn.setAttribute('aria-label','More');
      var ico = document.createElement('span'); ico.className = 'pe-toolbar-button__icon';
      // prefer registry more/overflow icon
      ico.innerHTML = getSvgForAction('more_vertical') || getSvgForAction('more') || '';
      overflowBtn.appendChild(ico);
      // menu
      var menu = document.createElement('div');
      menu.className = 'pe-block-toolbar__overflow-menu';
      menu.style.display = 'none';
      menu.style.position = 'absolute';
      menu.style.zIndex = 9999;
      menu.style.background = '#fff';
      menu.style.border = '1px solid #e5e7eb';
      menu.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
      menu.style.padding = '6px 0';
      overflow.forEach(function(action){
        var label = getActionLabel(action);
        var item = document.createElement('button');
        item.type = 'button';
        item.className = 'pe-block-toolbar__overflow-item components-button';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '8px';
        item.style.width = '200px';
        item.style.padding = '6px 12px';
        item.setAttribute('data-action', action);
        var iconSpan = document.createElement('span'); iconSpan.className = 'pe-toolbar-button__icon';
        var svg = getSvgForAction(action);
        iconSpan.innerHTML = svg || '';
        var textSpan = document.createElement('span'); textSpan.className = 'pe-toolbar-button__label'; textSpan.textContent = label;
        item.appendChild(iconSpan);
        item.appendChild(textSpan);
        wireAction(item, action, blockApi || {});
        menu.appendChild(item);
      });
      overflowBtn.addEventListener('click', function(e){
        e.stopPropagation();
        if (menu.style.display === 'none') menu.style.display = 'block'; else menu.style.display = 'none';
      });
      // close on outside click
      document.addEventListener('click', function(){ if (menu) menu.style.display = 'none'; });
      var container = document.createElement('div'); container.style.position = 'relative'; container.appendChild(overflowBtn); container.appendChild(menu);
      hostEl.appendChild(container);
    }
    // show/hide based on editor selection events
    if (window.EditorCore && typeof EditorCore.on === 'function'){
      var _handler = function(block){
        try{
          if (block && block.id && blockApi && blockApi.id && block.id === blockApi.id){
            hostEl.style.display = '';
          } else {
            hostEl.style.display = 'none';
          }
        }catch(e){}
      };
      // subscribe
      EditorCore.on('select', _handler);
      // keep handler ref so it can be removed later if needed
      try{ hostEl._toolbarSelectHandler = _handler; }catch(e){}
      // if there's already a selected block when created, update visibility
      try{ var sb = (typeof EditorCore.getSelectedBlock === 'function') ? EditorCore.getSelectedBlock() : null; _handler(sb); }catch(e){}
    }

    return hostEl;
  }

  // Top-toolbar support: optional host that receives controls for the currently selected block
  var __TOP_HOST = null;
  var __topHandler = null;

  function setTopToolbarHost(el){
    try{
      __TOP_HOST = el || null;
      // attach listener to EditorCore selection to render controls into top host
      if (__TOP_HOST && window.EditorCore && typeof EditorCore.on === 'function'){
        // remove previous
        if (__topHandler && typeof EditorCore.off === 'function') EditorCore.off('select', __topHandler);
        __topHandler = function(block){
          try{
            __TOP_HOST.innerHTML = '';
              if (!block || !block.id){ __TOP_HOST.style.display = 'none'; try{ __TOP_HOST.setAttribute('aria-hidden','true'); }catch(e){}; return; }
            // create a lightweight toolbar for top host using same visibleControls list
            var contextKey = block.type || 'default';
            var visible = getVisibleControls(contextKey);
            // render inline only (no overflow) for top toolbar
            visible.forEach(function(action){
              var label = getActionLabel(action);
              var btn = createButton(label, action);
              var ico = btn.querySelector('.pe-toolbar-button__icon');
              if (ico){ var svg = getSvgForAction(action); ico.innerHTML = svg || ''; }
              wireAction(btn, action, block || {});
              __TOP_HOST.appendChild(btn);
            });
            try{ __TOP_HOST.removeAttribute('aria-hidden'); }catch(e){}
            __TOP_HOST.style.display = '';
          }catch(e){ console.error(e); }
        };
        EditorCore.on('select', __topHandler);
        // initialize with current selection if present
        try{ var sb = (typeof EditorCore.getSelectedBlock === 'function') ? EditorCore.getSelectedBlock() : null; __topHandler(sb); }catch(e){}
      } else {
        // detach
        if (__topHandler && window.EditorCore && typeof EditorCore.off === 'function') EditorCore.off('select', __topHandler);
        __topHandler = null;
        if (__TOP_HOST) { try{ __TOP_HOST.setAttribute('aria-hidden','true'); }catch(e){}; __TOP_HOST.style.display = 'none'; }
      }
    }catch(e){ }
  }

  function clearTopToolbarHost(){ setTopToolbarHost(null); }

  window.ToolbarFactory = {
    createToolbar: createToolbar,
    getVisibleControls: getVisibleControls,
    setTopToolbarHost: setTopToolbarHost,
    clearTopToolbarHost: clearTopToolbarHost
  };
})();
