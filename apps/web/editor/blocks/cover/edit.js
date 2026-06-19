(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.cover = window.EditorBlockModules.cover || {};

  let activeCoverId = null;
  let listenersBound = false;
  const FEATURED_IMAGE_TOKEN = '__featured_image__';

  function normalizeBackground(background) {
    const base = {
      type: null,
      src: null,
      alt: '',
      poster: '',
      focalPoint: { x: 0.5, y: 0.5 },
      fixed: false,
      autoplay: true,
      loop: true
    };
    const next = Object.assign({}, base, background || {});
    const focalPoint = next.focalPoint && typeof next.focalPoint === 'object' ? next.focalPoint : {};
    next.focalPoint = {
      x: typeof focalPoint.x === 'number' ? focalPoint.x : 0.5,
      y: typeof focalPoint.y === 'number' ? focalPoint.y : 0.5
    };
    return next;
  }

  function ensureRuntime() {
    window.EditorCoverRuntime = window.EditorCoverRuntime || {};
    window.EditorCoverRuntime.getActiveContext = function () {
      return activeCoverId ? { blockId: activeCoverId, label: 'Cover Content' } : null;
    };
    window.EditorCoverRuntime.beginBrowse = function (blockId) {
      activeCoverId = blockId || null;
      if (window.EditorCore && typeof window.EditorCore.emit === 'function') {
        window.EditorCore.emit('state:changed', window.EditorCore.getState());
      }
    };
    window.EditorCoverRuntime.clearBrowse = function (blockId) {
      if (!blockId || activeCoverId === blockId) activeCoverId = null;
    };
  }

  function revealInserterPanel() {
    const root = document.querySelector('.editor-shell') || document.querySelector('.page-editor');
    const toggle = document.getElementById('pe-toggle-left');
    if (root && root.classList.contains('collapsed-left') && toggle && typeof toggle.click === 'function') {
      toggle.click();
      return;
    }
    if (root) root.classList.remove('collapsed-left');
    try {
      localStorage.setItem('editor.leftCollapsed', '0');
    } catch (_) { }
  }

  function focusInserter(blockId, helpers) {
    if (helpers && typeof helpers.selectBlock === 'function') helpers.selectBlock(blockId);
    if (window.EditorCoverRuntime && typeof window.EditorCoverRuntime.beginBrowse === 'function') {
      window.EditorCoverRuntime.beginBrowse(blockId);
    }
    revealInserterPanel();
    window.requestAnimationFrame(function () {
      const search = document.getElementById('pe-inserter-search');
      if (search && typeof search.focus === 'function') {
        search.focus();
        if (typeof search.select === 'function') search.select();
      }
    });
  }

  function getPageFeaturedImage() {
    if (!window.EditorCore || typeof window.EditorCore.getPage !== 'function') return '';
    const page = window.EditorCore.getPage();
    return page && page.attrs && page.attrs.featuredImage ? String(page.attrs.featuredImage).trim() : '';
  }

  function updateBackground(block, patch) {
    if (!block || !block.id || !window.EditorCore || typeof window.EditorCore.setBlockAttrs !== 'function') return;
    const current = block.attrs && block.attrs.background ? normalizeBackground(block.attrs.background) : normalizeBackground({});
    window.EditorCore.setBlockAttrs(block.id, {
      background: Object.assign({}, current, patch || {})
    });
  }

  function updateOverlay(block, patch) {
    if (!block || !block.id || !window.EditorCore || typeof window.EditorCore.setBlockAttrs !== 'function') return;
    const current = block.attrs && block.attrs.overlay ? Object.assign({ color: '#000000', opacity: 0.5 }, block.attrs.overlay) : { color: '#000000', opacity: 0.5 };
    window.EditorCore.setBlockAttrs(block.id, {
      overlay: Object.assign({}, current, patch || {})
    });
  }

  function inferBackgroundType(value, explicitType) {
    if (explicitType === 'video' || explicitType === 'image') return explicitType;
    const source = String(value || '').toLowerCase();
    if (!source) return null;
    if (/\.(mp4|webm|ogg|mov)(\?|#|$)/.test(source)) return 'video';
    return 'image';
  }

  async function pickFromLibrary(block) {
    if (!window.PrivateMediaLibrary || typeof window.PrivateMediaLibrary.openPicker !== 'function') {
      const url = window.prompt('Insert image or video URL');
      if (url) updateBackground(block, { type: inferBackgroundType(url), src: url, alt: '' });
      return;
    }
    try {
      const item = await window.PrivateMediaLibrary.openPicker({
        sourceId: 'web',
        title: 'Choose cover background',
        multiple: false
      });
      if (!item) return;
      const src = item.urlPath || item.path || '';
      updateBackground(block, {
        type: inferBackgroundType(src, item.contentType && String(item.contentType).startsWith('video/') ? 'video' : null),
        src: src,
        alt: item.name ? String(item.name).replace(/\.[^.]+$/, '') : ''
      });
    } catch (error) {
      if (error && error.message && error.message !== 'Picker closed.') {
        window.alert(error.message);
      }
    }
  }

  function uploadMedia(block) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', async function (event) {
      const file = event.target.files && event.target.files[0];
      input.remove();
      if (!file) return;
      if (window.PrivateMediaLibrary && typeof window.PrivateMediaLibrary.uploadMedia === 'function') {
        try {
          const uploaded = await window.PrivateMediaLibrary.uploadMedia(file, { sourceId: 'web' });
          updateBackground(block, {
            type: inferBackgroundType(uploaded && (uploaded.urlPath || uploaded.path || ''), file.type && file.type.startsWith('video/') ? 'video' : null),
            src: uploaded && (uploaded.urlPath || uploaded.path || ''),
            alt: file.type && file.type.startsWith('image/') ? file.name.replace(/\.[^.]+$/, '') : ''
          });
          return;
        } catch (error) {
          window.alert(error.message || 'Could not upload the selected media.');
        }
      }
      const objectUrl = URL.createObjectURL(file);
      updateBackground(block, {
        type: file.type && file.type.startsWith('video/') ? 'video' : 'image',
        src: objectUrl,
        alt: file.type && file.type.startsWith('image/') ? file.name.replace(/\.[^.]+$/, '') : ''
      });
    }, { once: true });
    input.click();
  }

  function useFeaturedImage(block) {
    const featuredImage = getPageFeaturedImage();
    if (!featuredImage) {
      window.alert('Set a featured image on the page first.');
      return;
    }
    updateBackground(block, {
      type: 'image',
      src: FEATURED_IMAGE_TOKEN,
      alt: ''
    });
  }

  function setBackgroundFromUrl(block) {
    const url = window.prompt('Insert image or video URL');
    if (!url) return;
    updateBackground(block, {
      type: inferBackgroundType(url),
      src: url
    });
  }

  function quickInsert(block, type) {
    if (!block || !block.id || !window.EditorCore || typeof window.EditorCore.emit !== 'function') return;
    const selectedId = window.EditorCore.getState && window.EditorCore.getState().selectedId;
    if (window.EditorCoverRuntime && typeof window.EditorCoverRuntime.beginBrowse === 'function') {
      window.EditorCoverRuntime.beginBrowse(block.id);
    }
    window.EditorCore.emit('insert', {
      type: type,
      afterBlockId: selectedId || null,
      containerBlockId: block.id
    });
  }

  function updateFocalPointFromEvent(block, target, event) {
    if (!block || !target) return;
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    updateBackground(block, { focalPoint: { x: x, y: y } });
  }

  function bindGlobalListeners() {
    if (listenersBound || !window.EditorCore || typeof window.EditorCore.on !== 'function') return;
    listenersBound = true;
    window.EditorCore.on('selection:changed', function (selection) {
      if (!window.EditorCore || typeof window.EditorCore.getBlocks !== 'function') return;
      if (!selection || !selection.id) {
        if (window.EditorCoverRuntime && typeof window.EditorCoverRuntime.clearBrowse === 'function') {
          window.EditorCoverRuntime.clearBrowse();
        }
        return;
      }
      const blocks = window.EditorCore.getBlocks();
      let matchedCoverId = null;
      function visit(entries, ownerCoverId) {
        const list = Array.isArray(entries) ? entries : [];
        for (let index = 0; index < list.length; index += 1) {
          const entry = list[index];
          if (!entry) continue;
          const currentOwner = entry.type === 'cover' ? entry.id : ownerCoverId;
          if (entry.id === selection.id) {
            matchedCoverId = currentOwner;
            return true;
          }
          const children = entry.attrs && Array.isArray(entry.attrs.children) ? entry.attrs.children : [];
          if (visit(children, currentOwner)) return true;
        }
        return false;
      }
      visit(blocks, null);
      if (matchedCoverId) {
        activeCoverId = matchedCoverId;
        return;
      }
      if (window.EditorCoverRuntime && typeof window.EditorCoverRuntime.clearBrowse === 'function') {
        window.EditorCoverRuntime.clearBrowse();
      }
    });
  }

  module.edit = function ({ block, blockElement, helpers }) {
    if (!block || !block.id || !blockElement) return false;
    ensureRuntime();
    bindGlobalListeners();

    const mediaActions = blockElement.querySelectorAll('[data-cover-action]');
    const browseButtons = blockElement.querySelectorAll('[data-cover-browse]');
    const quickButtons = blockElement.querySelectorAll('[data-cover-quick-add]');
    const childCanvas = blockElement.querySelector('[data-cover-canvas]');
    const focalTarget = blockElement.querySelector('[data-cover-focal-target]');

    mediaActions.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (helpers && typeof helpers.selectBlock === 'function') helpers.selectBlock(block.id);
        const action = button.dataset.coverAction;
        if (action === 'upload') uploadMedia(block);
        if (action === 'library') pickFromLibrary(block);
        if (action === 'featured') useFeaturedImage(block);
        if (action === 'url') setBackgroundFromUrl(block);
      });
    });

    browseButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        focusInserter(block.id, helpers);
      });
    });

    quickButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        quickInsert(block, button.dataset.coverQuickAdd || 'paragraph');
      });
    });

    if (childCanvas) {
      if (window.EditorCanvasRuntime && typeof window.EditorCanvasRuntime.attachBlockHandlers === 'function') {
        window.EditorCanvasRuntime.attachBlockHandlers(childCanvas);
      }
      childCanvas.querySelectorAll('[data-block-id], [data-id]').forEach(function (child) {
        child.addEventListener('click', function (event) {
          event.stopPropagation();
          if (helpers && typeof helpers.selectBlock === 'function') {
            helpers.selectBlock(child.getAttribute('data-block-id') || child.getAttribute('data-id'));
          }
          if (window.EditorCoverRuntime && typeof window.EditorCoverRuntime.beginBrowse === 'function') {
            window.EditorCoverRuntime.beginBrowse(block.id);
          }
        });
      });
    }

    if (focalTarget) {
      let dragging = false;
      const onMove = function (event) {
        if (!dragging) return;
        updateFocalPointFromEvent(block, focalTarget, event);
      };
      const stop = function () {
        dragging = false;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', stop);
      };
      focalTarget.addEventListener('pointerdown', function (event) {
        if (helpers && typeof helpers.selectBlock === 'function') helpers.selectBlock(block.id);
        dragging = true;
        updateFocalPointFromEvent(block, focalTarget, event);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', stop);
      });
    }

    return true;
  };
})();
