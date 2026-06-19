(function () {
  const DEPLOYED_API_BASE = 'https://storage-swa-ccctdwfnbneeaegr.australiaeast-01.azurewebsites.net/api';
  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isStaticWebAppsHost = /\.azurestaticapps\.net$/i.test(window.location.hostname);
  const configuredApiBase = typeof window.PAGE_MANAGER_API_BASE === 'string'
    ? window.PAGE_MANAGER_API_BASE.trim()
    : '';
  const API_BASE = configuredApiBase || ((isLocalHost || isStaticWebAppsHost) ? '/api' : DEPLOYED_API_BASE);
  const sourceRegistry = new Map();
  const pickerState = {
    options: null,
    items: [],
    filteredItems: [],
    selected: [],
    resolve: null,
    reject: null
  };
  let pickerEl = null;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showBytes(value) {
    const size = Number(value || 0);
    if (size >= 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB';
    if (size >= 1024) return Math.round(size / 1024) + ' KB';
    return size + ' B';
  }

  async function buildAuthHeaders(includeJson) {
    const headers = {};
    if (includeJson) headers['Content-Type'] = 'application/json';
    if (isLocalHost) return headers;
    if (!window.SiteAuth || typeof window.SiteAuth.getIdToken !== 'function') {
      const error = new Error('Sign in from the site header before managing media.');
      error.code = 'AUTH_REQUIRED';
      throw error;
    }
    const idToken = await window.SiteAuth.getIdToken();
    headers.Authorization = 'Bearer ' + idToken;
    headers['x-site-id-token'] = idToken;
    return headers;
  }

  async function apiRequest(path, options) {
    const requestOptions = options || {};
    const includeJson = !!requestOptions.includeJson;
    const headers = await buildAuthHeaders(includeJson);
    const response = await fetch(API_BASE + path, {
      method: requestOptions.method || 'GET',
      headers,
      body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.error || ('Request failed with status ' + response.status + '.'));
      error.status = response.status;
      throw error;
    }
    return body;
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function () {
        const result = String(reader.result || '');
        const commaIndex = result.indexOf(',');
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      };
      reader.onerror = function () {
        reject(new Error('Could not read the selected file.'));
      };
      reader.readAsDataURL(file);
    });
  }

  function normalizeItem(sourceId, item) {
    const source = sourceRegistry.get(sourceId);
    return {
      id: String(item && (item.path || item.urlPath || item.name || item.id) || ''),
      sourceId,
      sourceLabel: source ? source.label : sourceId,
      path: item && item.path ? item.path : '',
      urlPath: item && item.urlPath ? item.urlPath : '',
      name: item && item.name ? item.name : '',
      contentType: item && item.contentType ? item.contentType : '',
      size: Number(item && item.size || 0),
      updatedAt: item && item.updatedAt ? item.updatedAt : null
    };
  }

  function registerSource(source) {
    if (!source || !source.id) return;
    sourceRegistry.set(source.id, Object.assign({
      supportsUpload: false
    }, source));
  }

  function getSources() {
    return Array.from(sourceRegistry.values());
  }

  function getSource(sourceId) {
    const sources = getSources();
    if (sourceId && sourceRegistry.has(sourceId)) return sourceRegistry.get(sourceId);
    return sources[0] || null;
  }

  async function listMedia(options) {
    const source = getSource(options && options.sourceId);
    if (!source || typeof source.list !== 'function') return [];
    const items = await source.list(options || {});
    return (Array.isArray(items) ? items : []).map((item) => normalizeItem(source.id, item));
  }

  async function uploadMedia(file, options) {
    const source = getSource(options && options.sourceId);
    if (!source || typeof source.upload !== 'function') {
      throw new Error('This media source does not support uploads yet.');
    }
    const item = await source.upload(file, options || {});
    return normalizeItem(source.id, item);
  }

  function ensurePickerStyles() {
    if (document.getElementById('private-media-library-picker-styles')) return;
    const style = document.createElement('style');
    style.id = 'private-media-library-picker-styles';
    style.textContent = [
      '.pml-picker{position:fixed;inset:0;display:none;z-index:2000;}',
      '.pml-picker.is-open{display:block;}',
      '.pml-picker__backdrop{position:absolute;inset:0;background:rgba(15,23,42,.45);}',
      '.pml-picker__dialog{position:relative;max-width:1120px;margin:40px auto;background:#fff;border-radius:20px;box-shadow:0 24px 60px rgba(15,23,42,.22);padding:24px;display:grid;gap:18px;}',
      '.pml-picker__header,.pml-picker__toolbar,.pml-picker__footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}',
      '.pml-picker__toolbar{align-items:end;}',
      '.pml-picker__toolbar label{display:grid;gap:6px;min-width:220px;font-size:13px;color:#475569;}',
      '.pml-picker__toolbar input,.pml-picker__toolbar select{min-height:38px;padding:8px 10px;border:1px solid rgba(15,23,42,.14);border-radius:10px;}',
      '.pml-picker__status{font-size:13px;color:#475569;min-height:20px;}',
      '.pml-picker__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;max-height:min(70vh,680px);overflow:auto;}',
      '.pml-picker__card{display:grid;gap:10px;padding:12px;border:1px solid rgba(15,23,42,.12);border-radius:16px;background:#fff;text-align:left;cursor:pointer;}',
      '.pml-picker__card.is-selected{border-color:#2563eb;box-shadow:0 0 0 2px rgba(37,99,235,.18);}',
      '.pml-picker__thumb{aspect-ratio:4/3;border-radius:12px;background:#e2e8f0;overflow:hidden;display:flex;align-items:center;justify-content:center;}',
      '.pml-picker__thumb img{width:100%;height:100%;object-fit:cover;display:block;}',
      '.pml-picker__meta{display:grid;gap:4px;font-size:12px;color:#64748b;}',
      '.pml-picker__name{font-size:14px;font-weight:600;color:#0f172a;word-break:break-word;}',
      '.pml-picker__empty{padding:24px;border:1px dashed rgba(15,23,42,.18);border-radius:16px;color:#64748b;text-align:center;}',
      '.pml-button-row{display:flex;gap:10px;flex-wrap:wrap;}',
      '.pml-button{min-height:38px;padding:0 14px;border-radius:999px;border:1px solid rgba(15,23,42,.14);background:#fff;color:#0f172a;cursor:pointer;}',
      '.pml-button.primary{background:#2563eb;border-color:#2563eb;color:#fff;}',
      '.pml-button[disabled]{opacity:.55;cursor:not-allowed;}'
    ].join('');
    document.head.appendChild(style);
  }

  function ensurePicker() {
    if (pickerEl) return pickerEl;
    ensurePickerStyles();
    pickerEl = document.createElement('div');
    pickerEl.className = 'pml-picker';
    pickerEl.setAttribute('aria-hidden', 'true');
    pickerEl.innerHTML = [
      '<div class="pml-picker__backdrop" data-close-picker="true"></div>',
      '<div class="pml-picker__dialog" role="dialog" aria-modal="true" aria-labelledby="pml-picker-title">',
      '<div class="pml-picker__header">',
      '<div><p class="search-breadcrumb">Media library</p><h2 id="pml-picker-title">Choose media</h2></div>',
      '<button type="button" class="pml-button" data-close-picker="true">Close</button>',
      '</div>',
      '<div class="pml-picker__toolbar">',
      '<label>Source<select id="pml-picker-source"></select></label>',
      '<label>Search<input id="pml-picker-search" type="search" placeholder="Filter by name or path" autocomplete="off"></label>',
      '<div class="pml-button-row"><button type="button" id="pml-picker-upload" class="pml-button">Upload</button><button type="button" id="pml-picker-refresh" class="pml-button">Refresh</button></div>',
      '</div>',
      '<p id="pml-picker-status" class="pml-picker__status"></p>',
      '<div id="pml-picker-grid" class="pml-picker__grid"></div>',
      '<div id="pml-picker-empty" class="pml-picker__empty" hidden>No media items matched the current filter.</div>',
      '<div class="pml-picker__footer"><div id="pml-picker-selection" class="pml-picker__status"></div><button type="button" id="pml-picker-apply" class="pml-button primary">Use selected</button></div>',
      '</div>'
    ].join('');
    pickerEl.addEventListener('click', function (event) {
      const target = event.target;
      if (target && target.dataset && target.dataset.closePicker === 'true') {
        closePicker();
      }
    });
    document.body.appendChild(pickerEl);
    pickerEl.querySelector('#pml-picker-search').addEventListener('input', filterPickerItems);
    pickerEl.querySelector('#pml-picker-source').addEventListener('change', refreshPickerItems);
    pickerEl.querySelector('#pml-picker-refresh').addEventListener('click', refreshPickerItems);
    pickerEl.querySelector('#pml-picker-upload').addEventListener('click', openUploadDialog);
    pickerEl.querySelector('#pml-picker-apply').addEventListener('click', applyPickerSelection);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && pickerEl && pickerEl.classList.contains('is-open')) {
        closePicker();
      }
    });
    return pickerEl;
  }

  function setPickerStatus(message) {
    const status = ensurePicker().querySelector('#pml-picker-status');
    status.textContent = message || '';
  }

  function renderPickerItems() {
    const picker = ensurePicker();
    const grid = picker.querySelector('#pml-picker-grid');
    const empty = picker.querySelector('#pml-picker-empty');
    const selection = picker.querySelector('#pml-picker-selection');
    const applyButton = picker.querySelector('#pml-picker-apply');
    grid.innerHTML = '';
    const items = pickerState.filteredItems || [];
    empty.hidden = items.length > 0;
    items.forEach(function (item) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'pml-picker__card';
      if (pickerState.selected.some((selected) => selected.id === item.id)) {
        card.classList.add('is-selected');
      }
      card.innerHTML = [
        '<div class="pml-picker__thumb"><img src="' + escapeHtml(item.urlPath) + '" alt="' + escapeHtml(item.name) + '"></div>',
        '<div class="pml-picker__meta">',
        '<div class="pml-picker__name">' + escapeHtml(item.name || item.path) + '</div>',
        '<div>' + escapeHtml(item.path || '') + '</div>',
        '<div>' + escapeHtml(showBytes(item.size)) + (item.updatedAt ? ' · ' + escapeHtml(new Date(item.updatedAt).toLocaleString()) : '') + '</div>',
        '</div>'
      ].join('');
      card.addEventListener('click', function () {
        if (pickerState.options && pickerState.options.multiple) {
          const exists = pickerState.selected.some((selected) => selected.id === item.id);
          pickerState.selected = exists
            ? pickerState.selected.filter((selected) => selected.id !== item.id)
            : pickerState.selected.concat(item);
          renderPickerItems();
          return;
        }
        finishPicker([item]);
      });
      grid.appendChild(card);
    });
    selection.textContent = pickerState.selected.length ? pickerState.selected.length + ' item(s) selected' : '';
    applyButton.hidden = !(pickerState.options && pickerState.options.multiple);
    applyButton.disabled = pickerState.selected.length === 0;
  }

  function filterPickerItems() {
    const picker = ensurePicker();
    const query = String(picker.querySelector('#pml-picker-search').value || '').trim().toLowerCase();
    pickerState.filteredItems = pickerState.items.filter(function (item) {
      return !query || [item.name, item.path, item.contentType, item.sourceLabel].some(function (value) {
        return String(value || '').toLowerCase().includes(query);
      });
    });
    renderPickerItems();
  }

  async function refreshPickerItems() {
    const picker = ensurePicker();
    const sourceId = picker.querySelector('#pml-picker-source').value;
    setPickerStatus('Loading media…');
    try {
      pickerState.items = await listMedia({ sourceId: sourceId });
      pickerState.selected = [];
      setPickerStatus(pickerState.items.length ? '' : 'No media items are available in this source yet.');
      filterPickerItems();
    } catch (error) {
      pickerState.items = [];
      pickerState.filteredItems = [];
      pickerState.selected = [];
      setPickerStatus(error.message || 'Could not load media.');
      renderPickerItems();
    }
  }

  function finishPicker(selection) {
    const items = Array.isArray(selection) ? selection : [];
    const resolve = pickerState.resolve;
    closePicker(false);
    if (resolve) {
      resolve(pickerState.options && pickerState.options.multiple ? items : (items[0] || null));
    }
  }

  function applyPickerSelection() {
    finishPicker(pickerState.selected);
  }

  function closePicker(rejectOpen) {
    if (!pickerEl) return;
    pickerEl.classList.remove('is-open');
    pickerEl.setAttribute('aria-hidden', 'true');
    if (rejectOpen !== false && pickerState.reject) {
      pickerState.reject(new Error('Picker closed.'));
    }
    pickerState.options = null;
    pickerState.items = [];
    pickerState.filteredItems = [];
    pickerState.selected = [];
    pickerState.resolve = null;
    pickerState.reject = null;
  }

  function openUploadDialog() {
    const picker = ensurePicker();
    const sourceId = picker.querySelector('#pml-picker-source').value;
    const source = getSource(sourceId);
    if (!source || !source.supportsUpload) {
      setPickerStatus('Uploads are not available for this source yet.');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = source.accept || 'image/*';
    input.multiple = !!(pickerState.options && pickerState.options.multiple);
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', async function () {
      const files = Array.from(input.files || []);
      input.remove();
      if (!files.length) return;
      setPickerStatus('Uploading media…');
      try {
        const uploaded = [];
        for (const file of files) {
          uploaded.push(await uploadMedia(file, { sourceId: sourceId }));
        }
        setPickerStatus('Uploaded ' + uploaded.length + ' item(s).');
        await refreshPickerItems();
        if (pickerState.options && pickerState.options.multiple) {
          pickerState.selected = uploaded;
          renderPickerItems();
        } else if (uploaded[0]) {
          finishPicker([uploaded[0]]);
        }
      } catch (error) {
        setPickerStatus(error.message || 'Could not upload media.');
      }
    }, { once: true });
    input.click();
  }

  function openPicker(options) {
    const picker = ensurePicker();
    const nextOptions = Object.assign({
      title: 'Choose media',
      sourceId: 'web',
      multiple: false
    }, options || {});
    pickerState.options = nextOptions;
    pickerState.selected = [];
    picker.querySelector('#pml-picker-title').textContent = nextOptions.title;
    const sourceSelect = picker.querySelector('#pml-picker-source');
    const sources = getSources();
    sourceSelect.innerHTML = sources.map(function (source) {
      const selected = source.id === nextOptions.sourceId ? ' selected' : '';
      return '<option value="' + escapeHtml(source.id) + '"' + selected + '>' + escapeHtml(source.label) + '</option>';
    }).join('');
    picker.classList.add('is-open');
    picker.setAttribute('aria-hidden', 'false');
    picker.querySelector('#pml-picker-search').value = '';
    return new Promise(function (resolve, reject) {
      pickerState.resolve = resolve;
      pickerState.reject = reject;
      refreshPickerItems();
    });
  }

  registerSource({
    id: 'web',
    label: '$web container',
    supportsUpload: true,
    accept: 'image/avif,image/gif,image/jpeg,image/png,image/svg+xml,image/webp',
    async list() {
      const result = await apiRequest('/list-images');
      return Array.isArray(result.items) ? result.items : [];
    },
    async upload(file) {
      const base64Content = await fileToBase64(file);
      const result = await apiRequest('/upload-image', {
        method: 'POST',
        includeJson: true,
        body: {
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          base64Content: base64Content
        }
      });
      return {
        path: result.path,
        urlPath: result.urlPath,
        name: String(result.path || '').replace(/^images\//i, ''),
        contentType: result.contentType || file.type || '',
        size: file.size || 0,
        updatedAt: new Date().toISOString()
      };
    }
  });

  window.PrivateMediaLibrary = {
    registerSource,
    getSources,
    getSource,
    listMedia,
    uploadMedia,
    openPicker,
    closePicker
  };
})();
