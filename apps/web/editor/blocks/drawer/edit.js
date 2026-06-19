(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.drawer = window.EditorBlockModules.drawer || {};

  let openDrawerId = null;
  let browseTargetId = null;
  let dismissIcon = '';
  let listenersBound = false;

  function loadIcon(title) {
    const paths = [
      '/design-system/icon-registry.json',
      '../../design-system/icon-registry.json',
      '../design-system/icon-registry.json',
      './icon-registry.json'
    ];
    for (let index = 0; index < paths.length; index += 1) {
      try {
        const req = new XMLHttpRequest();
        req.open('GET', paths[index], false);
        req.send(null);
        if (req.status !== 200 || !req.responseText) continue;
        const registry = JSON.parse(req.responseText);
        const icons = registry && registry.regular ? registry.regular : [];
        const match = icons.find((item) => item && item.title === title);
        if (match && match.source) return match.source;
      } catch (_) { }
    }
    return '';
  }

  function ensureRuntime() {
    if (!dismissIcon) dismissIcon = loadIcon('ic_fluent_dismiss_24_regular');
    window.EditorDrawerRuntime = window.EditorDrawerRuntime || {};
    window.EditorDrawerRuntime.getActiveContext = function () {
      const activeId = browseTargetId || openDrawerId;
      return activeId ? { blockId: activeId, label: 'Drawer Canvas' } : null;
    };
    window.EditorDrawerRuntime.isDrawerOpen = function (blockId) {
      return openDrawerId === blockId;
    };
    window.EditorDrawerRuntime.openDrawer = function (blockId) {
      if (!blockId || openDrawerId === blockId) return;
      openDrawerId = blockId;
      if (browseTargetId === blockId) browseTargetId = null;
      document.body.classList.add('has-site-drawer-open');
      if (window.EditorCore && typeof window.EditorCore.emit === 'function') {
        window.EditorCore.emit('state:changed', window.EditorCore.getState());
      }
    };
    window.EditorDrawerRuntime.closeDrawer = function (blockId) {
      if (blockId && openDrawerId !== blockId) return;
      openDrawerId = null;
      document.body.classList.remove('has-site-drawer-open');
      if (window.EditorCore && typeof window.EditorCore.emit === 'function') {
        window.EditorCore.emit('state:changed', window.EditorCore.getState());
      }
    };
    window.EditorDrawerRuntime.getDismissIcon = function () {
      return dismissIcon || '×';
    };
    window.EditorDrawerRuntime.beginBrowse = function (blockId) {
      if (!blockId) return;
      browseTargetId = blockId;
      if (openDrawerId === blockId) openDrawerId = null;
      document.body.classList.remove('has-site-drawer-open');
      if (window.EditorCore && typeof window.EditorCore.emit === 'function') {
        window.EditorCore.emit('state:changed', window.EditorCore.getState());
      }
    };
    window.EditorDrawerRuntime.clearBrowse = function (blockId) {
      if (!blockId || browseTargetId === blockId) browseTargetId = null;
    };
  }

  function closeDrawer(blockId) {
    if (window.EditorDrawerRuntime && typeof window.EditorDrawerRuntime.closeDrawer === 'function') {
      window.EditorDrawerRuntime.closeDrawer(blockId);
    }
  }

  function openDrawer(blockId) {
    if (window.EditorDrawerRuntime && typeof window.EditorDrawerRuntime.openDrawer === 'function') {
      window.EditorDrawerRuntime.openDrawer(blockId);
    }
  }

  function revealInserterPanel() {
    const root = document.querySelector('.editor-shell') || document.querySelector('.page-editor');
    const toggle = document.getElementById('pe-toggle-left');
    if (root && root.classList.contains('collapsed-left') && toggle && typeof toggle.click === 'function') {
      toggle.click();
      return;
    }
    if (root) {
      root.classList.remove('collapsed-left');
    }
    try {
      localStorage.setItem('editor.leftCollapsed', '0');
    } catch (_) { }
  }

  function focusInserter(blockId, helpers) {
    if (helpers && typeof helpers.selectBlock === 'function') helpers.selectBlock(blockId);
    if (window.EditorDrawerRuntime && typeof window.EditorDrawerRuntime.beginBrowse === 'function') {
      window.EditorDrawerRuntime.beginBrowse(blockId);
    }
    revealInserterPanel();
    window.requestAnimationFrame(function () {
      const inserterSearch = document.getElementById('pe-inserter-search');
      if (inserterSearch && typeof inserterSearch.focus === 'function') {
        inserterSearch.focus();
        if (typeof inserterSearch.select === 'function') inserterSearch.select();
      }
    });
  }

  function quickInsert(block, type) {
    if (!block || !block.id || !window.EditorCore || typeof window.EditorCore.emit !== 'function') return;
    const selectedId = window.EditorCore.getState && window.EditorCore.getState().selectedId;
    window.EditorCore.emit('insert', {
      type: type,
      afterBlockId: selectedId || null,
      containerBlockId: block.id
    });
    openDrawer(block.id);
  }

  function bindGlobalListeners() {
    if (listenersBound || !window.EditorCore) return;
    listenersBound = true;
    window.EditorCore.on('selection:changed', function (selection) {
      if (!selection || !selection.id || !window.EditorCore || typeof window.EditorCore.getBlocks !== 'function') return;
      const blocks = window.EditorCore.getBlocks();
      const drawer = (Array.isArray(blocks) ? blocks : []).find(function (block) {
        if (!block || block.type !== 'drawer' || !block.attrs || !Array.isArray(block.attrs.children)) return false;
        const stack = block.attrs.children.slice();
        while (stack.length) {
          const child = stack.shift();
          if (!child) continue;
          if (child.id === selection.id) return true;
          const children = child.attrs && Array.isArray(child.attrs.children) ? child.attrs.children : [];
          children.forEach(function (entry) { stack.push(entry); });
        }
        return false;
      });
      if (drawer) {
        openDrawer(drawer.id);
        return;
      }
      if (window.EditorDrawerRuntime && typeof window.EditorDrawerRuntime.clearBrowse === 'function') {
        window.EditorDrawerRuntime.clearBrowse();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && openDrawerId) {
        event.preventDefault();
        closeDrawer(openDrawerId);
      }
    });
  }

  module.edit = function ({ block, blockElement, helpers }) {
    if (!block || !block.id || !blockElement || !window.EditorCore) return false;
    ensureRuntime();
    bindGlobalListeners();

    const editButton = blockElement.querySelector('[data-drawer-edit]');
    const trigger = blockElement.querySelector('[data-drawer-trigger]');
    const dismiss = blockElement.querySelector('[data-drawer-dismiss]');
    const backdrop = blockElement.querySelector('[data-drawer-backdrop]');
    const panel = blockElement.querySelector('[data-drawer-panel]');
    const childCanvas = blockElement.querySelector('[data-drawer-canvas]');
    const addButtons = blockElement.querySelectorAll('[data-drawer-add]');
    const quickAddButtons = blockElement.querySelectorAll('[data-drawer-quick-add]');

    function handleOpen(event) {
      event.preventDefault();
      event.stopPropagation();
      if (helpers && typeof helpers.selectBlock === 'function') helpers.selectBlock(block.id);
      openDrawer(block.id);
    }

    if (trigger) trigger.addEventListener('click', handleOpen);
    if (editButton) editButton.addEventListener('click', handleOpen);
    if (dismiss) dismiss.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      closeDrawer(block.id);
    });
    if (backdrop) {
      backdrop.addEventListener('click', function (event) {
        if (block.attrs && block.attrs.closeOnOutside === false) return;
        event.preventDefault();
        closeDrawer(block.id);
      });
    }
    if (panel) {
      panel.addEventListener('click', function (event) {
        event.stopPropagation();
      });
    }
    addButtons.forEach(function (addButton) {
      addButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        focusInserter(block.id, helpers);
      });
    });
    quickAddButtons.forEach(function (quickAddButton) {
      quickAddButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        quickInsert(block, quickAddButton.dataset.drawerQuickAdd || 'paragraph');
      });
    });

    if (childCanvas) {
      if (window.EditorCanvasRuntime && typeof window.EditorCanvasRuntime.attachBlockHandlers === 'function') {
        window.EditorCanvasRuntime.attachBlockHandlers(childCanvas);
      }
      childCanvas.querySelectorAll('[data-block-id], [data-id]').forEach(function (child) {
        child.addEventListener('click', function (event) {
          event.stopPropagation();
          if (helpers && typeof helpers.selectBlock === 'function') helpers.selectBlock(child.getAttribute('data-block-id') || child.getAttribute('data-id'));
          openDrawer(block.id);
        });
      });
    }
    return true;
  };
})();
