(() => {
  const IMAGE_LIBRARY_PATH = '/images';
  const IMAGE_UPLOAD_PATH = '/upload-image';
  const CREATE_PAGE_PATH = '/create-page';
  const EDIT_PAGE_PATH = '/edit-page';
  const UPSERT_POST_PATH = '/upsert-post';
  const GET_POST_ADMIN_PATH = '/get-post-admin';
  const DEFAULT_PREVIEW_LABEL = 'Preview not refreshed';
  const INSERTER_PREFS_KEY = 'page-editor-inserter-prefs';

  const elements = {
    app: document.getElementById('pe-app'),
    canvas: document.getElementById('pe-editor-canvas'),
    blockGroups: document.getElementById('pe-block-groups'),
    inserterSearch: document.getElementById('pe-inserter-search'),
    previewFrame: document.getElementById('pe-preview-frame'),
    previewButton: document.getElementById('pe-preview-btn'),
    undoButton: document.getElementById('pe-undo-btn'),
    redoButton: document.getElementById('pe-redo-btn'),
    saveButton: document.getElementById('pe-save-btn'),
    publishButton: document.getElementById('pe-publish-btn'),
    clearButton: document.getElementById('pe-clear-btn'),
    addRootBlockButton: document.getElementById('pe-add-root-block'),
    toggleLeftButton: document.getElementById('pe-toggle-left'),
    toggleRightButton: document.getElementById('pe-toggle-right'),
    pageHeading: document.getElementById('pe-page-heading'),
    documentState: document.getElementById('pe-document-state'),
    selectedLabel: document.getElementById('pe-selected-label'),
    dirtyLabel: document.getElementById('pe-dirty-label'),
    previewLabel: document.getElementById('pe-preview-label'),
    status: document.getElementById('pe-status'),
    message: document.getElementById('pe-message'),
    canvasTitle: document.getElementById('pe-canvas-title'),
    pageTitleLabel: document.getElementById('pe-page-title-label'),
    pageTitle: document.getElementById('pe-page-title'),
    pagePathLabel: document.getElementById('pe-page-path-label'),
    pagePath: document.getElementById('pe-page-path'),
    pathSummary: document.getElementById('pe-path-summary'),
    pageStatusLabel: document.getElementById('pe-page-status-label'),
    blockCountLabel: document.getElementById('pe-block-count-label'),
    selectionSummaryLabel: document.getElementById('pe-selection-summary-label'),
    pageSettingsPanel: document.getElementById('pe-page-settings'),
    postSettingsPanel: document.getElementById('pe-post-settings'),
    postExcerpt: document.getElementById('pe-post-excerpt'),
    postCategories: document.getElementById('pe-post-categories'),
    postTags: document.getElementById('pe-post-tags'),
    postFeaturedImage: document.getElementById('pe-post-featured-image'),
    postDate: document.getElementById('pe-post-date'),
    inspectorPanel: document.getElementById('pe-inspector-content'),
    overviewPanel: document.getElementById('pe-overview-panel'),
    overviewList: document.getElementById('pe-overview-list'),
    inspectorTabs: Array.from(document.querySelectorAll('.pe-inspector-tab'))
  };

  if (!elements.app || !elements.canvas || !elements.blockGroups || !elements.previewFrame) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const editorKind = params.get('kind') === 'post' ? 'post' : 'page';
  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isStaticWebAppsHost = /\.azurestaticapps\.net$/i.test(window.location.hostname);
  const isRepoRootPrivatePreview = /^\/app-private\//i.test(window.location.pathname);
  const API_BASE = window.PAGE_MANAGER_API_BASE || '/api';
  const domParser = new DOMParser();

  let nextBlockIdValue = 1;
  let activeInsertMenu = null;
  let pendingHistorySnapshot = null;
  const undoStack = [];
  const redoStack = [];
  const iconRegistry = {
    blocks: {},
    editor: {}
  };

  function resolveAppAssetPath(path) {
    const value = String(path || '').trim();
    if (!value || !value.startsWith('/')) {
      return value;
    }

    return isRepoRootPrivatePreview ? '/app-private' + value : value;
  }

  function getIconRegistryPath() {
    return isRepoRootPrivatePreview ? '/design-system/icon-registry.json' : 'icon-registry.json';
  }

  const imageLibraryState = {
    blockId: null,
    items: []
  };

  const state = {
    page: {
      kind: editorKind,
      title: '',
      path: '',
      pathEdited: false,
      status: 'Draft',
      published: false,
      excerpt: '',
      categories: '',
      tags: '',
      featuredImage: '',
      date: ''
    },
    source: {
      manifestPath: '',
      contentPath: '',
      scriptPath: '',
      postSlug: '',
      manifest: null,
      scriptContent: '',
      loadFailed: false
    },
    blocks: [],
    selectedBlockId: null,
    ui: {
      leftExpanded: true,
      rightExpanded: true,
      inspectorTab: 'page',
      inserterQuery: '',
      collapsedCategories: loadInserterPrefs().collapsedCategories,
      lastUsedCategory: loadInserterPrefs().lastUsedCategory,
      dirty: false,
      saving: false,
      publishing: false,
      canUndo: false,
      canRedo: false,
      statusMessage: '',
      flashMessage: '',
      flashError: false,
      previewLabel: DEFAULT_PREVIEW_LABEL
    }
  };

  const BLOCK_DEFINITIONS = window.EDITOR_BLOCK_DEFINITIONS || {
    paragraph: {
      label: 'Paragraph',
      fallbackIcon: 'P',
      category: 'Text',
      description: 'Body copy with inline formatting.',
      create: () => ({ html: '', align: 'left', className: '' })
    },
    heading: {
      label: 'Heading',
      fallbackIcon: 'H',
      category: 'Text',
      description: 'Section title with level control.',
      create: () => ({ text: 'Heading', level: 2, align: 'left' })
    },
    image: {
      label: 'Image',
      fallbackIcon: 'I',
      category: 'Media',
      description: 'Uploaded or library-backed image block.',
      create: () => ({ src: '', alt: '', caption: '', linkHref: '', width: '', height: '', className: '', align: 'wide' })
    },
    video: {
      label: 'Video',
      fallbackIcon: 'V',
      category: 'Media',
      description: 'Video source with optional caption.',
      create: () => ({ src: '', caption: '', poster: '', autoplay: false, loop: false, muted: false, controls: true, className: '', align: 'wide' })
    },
    code: {
      label: 'Code',
      fallbackIcon: '{}',
      category: 'Text',
      description: 'Preformatted code block.',
      create: () => ({ code: '', language: '', align: 'left' })
    },
    embed: {
      label: 'Embed',
      fallbackIcon: '</>',
      category: 'Embed',
      description: 'Trusted embed HTML or source URL.',
      create: () => ({ url: '', html: '', provider: '', caption: '', aspectRatio: '16x9', className: '', align: 'wide' })
    },
    separator: {
      label: 'Separator',
      fallbackIcon: '-',
      category: 'Design',
      description: 'Visual divider between sections.',
      create: () => ({ style: 'default', className: '', align: 'full' })
    },
    group: {
      label: 'Group',
      fallbackIcon: '[]',
      category: 'Design',
      description: 'Section wrapper for grouped content.',
      create: () => ({ title: 'Section heading', text: '', tag: 'section', layout: 'stack', backgroundColor: '', textColor: '', padding: '2rem 1.5rem', margin: '', className: '', align: 'wide' })
    },
    button: {
      label: 'Button',
      fallbackIcon: 'CTA',
      category: 'Interactive',
      description: 'Call-to-action button with link and style controls.',
      create: () => ({ text: 'Call to action', url: '#', variant: 'primary', backgroundColor: '', textColor: '', radius: '999px', className: '', align: 'left' })
    },
    spacer: {
      label: 'Spacer',
      fallbackIcon: '↕',
      category: 'Design',
      description: 'Vertical whitespace block with adjustable height.',
      create: () => ({ height: '48px', preset: 'medium', className: '', align: 'full' })
    },
    divider: {
      label: 'Divider',
      fallbackIcon: '=',
      category: 'Design',
      description: 'Decorative divider with style and thickness controls.',
      create: () => ({ style: 'solid', thickness: '2px', width: 'full', className: '', align: 'full' })
    },
    card: {
      label: 'Card',
      fallbackIcon: '▣',
      category: 'Design',
      description: 'Highlighted container shell with surface styling.',
      create: () => ({ title: 'Card title', text: 'Card body copy', backgroundColor: '#ffffff', borderRadius: '24px', shadow: 'medium', padding: '1.5rem', className: '', align: 'wide' })
    },
    hero: {
      label: 'Hero',
      fallbackIcon: '★',
      category: 'Design',
      description: 'Large banner section with background and optional CTA.',
      create: () => ({ eyebrow: '', title: 'Hero title', text: 'Supporting hero copy', backgroundImage: '', backgroundColor: '#0f172a', overlayColor: 'rgba(15,23,42,0.45)', minHeight: '320px', ctaText: '', ctaHref: '', className: '', align: 'full' })
    },
    icon: {
      label: 'Icon',
      fallbackIcon: '◎',
      category: 'Design',
      description: 'Standalone icon or symbol with size and color settings.',
      create: () => ({ icon: 'star', size: '48px', color: '#02760c', label: '', className: '', align: 'left' })
    },
    callout: {
      label: 'Callout',
      fallbackIcon: '!',
      category: 'Design',
      description: 'Notice block for tips, warnings, and status messages.',
      create: () => ({ variant: 'info', title: 'Notice title', text: 'Important supporting message.', showIcon: true, className: '', align: 'wide' })
    },
    background: {
      label: 'Background',
      fallbackIcon: '▒',
      category: 'Design',
      description: 'Stylized wrapper section with background treatments.',
      create: () => ({ title: 'Background section', text: 'Wrapped content summary', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', overlay: '', padding: '2rem', borderRadius: '24px', className: '', align: 'wide' })
    },
    columns: {
      label: 'Columns',
      fallbackIcon: 'Ⅱ',
      category: 'Layout',
      description: 'Multi-column layout shell with adjustable gaps.',
      create: () => ({ columns: 2, gap: '24px', text: 'Add column content summary', className: '', align: 'wide' })
    },
    grid: {
      label: 'Grid',
      fallbackIcon: '▦',
      category: 'Layout',
      description: 'Uniform grid shell with configurable columns and minimum width.',
      create: () => ({ columns: 3, minWidth: '180px', gap: '20px', text: 'Add grid content summary', items: [[], [], []], className: '', align: 'wide' })
    },
    'search-results': {
      label: 'Search Results',
      fallbackIcon: '▤',
      category: 'Interactive',
      description: 'Dynamic, filterable grid of search results with card templates.',
      create: () => ({
        dataSource: '',
        template: 'card',
        columns: 3,
        pageSize: 6,
        showModified: true,
        showContributors: true,
        className: '',
        align: 'wide'
      })
    },
    row: {
      label: 'Row',
      fallbackIcon: '↔',
      category: 'Layout',
      description: 'Horizontal layout shell with wrap and alignment settings.',
      create: () => ({ title: 'Row', text: 'Horizontal layout content summary', justify: 'space-between', gap: '16px', wrap: true, className: '', align: 'wide' })
    },
    accordion: {
      label: 'Accordion',
      fallbackIcon: '⌄',
      category: 'Interactive',
      description: 'Collapsible shell block for grouped content.',
      create: () => ({ title: 'Accordion item', text: 'Collapsible content summary', open: false, showIcon: true, className: '', align: 'wide' })
    }
  };

  const BLOCK_ORDER = window.EDITOR_BLOCK_ORDER || ['paragraph', 'heading', 'image', 'video', 'code', 'embed', 'separator', 'group', 'button', 'spacer', 'divider', 'card', 'hero', 'icon', 'callout', 'background', 'columns', 'grid', 'search-results', 'row', 'accordion'];

  function loadInserterPrefs() {
    try {
      const raw = window.localStorage.getItem(INSERTER_PREFS_KEY);
      if (!raw) {
        return { collapsedCategories: [], lastUsedCategory: '' };
      }
      const parsed = JSON.parse(raw);
      return {
        collapsedCategories: Array.isArray(parsed.collapsedCategories) ? parsed.collapsedCategories : [],
        lastUsedCategory: typeof parsed.lastUsedCategory === 'string' ? parsed.lastUsedCategory : ''
      };
    } catch (_) {
      return { collapsedCategories: [], lastUsedCategory: '' };
    }
  }

  function saveInserterPrefs() {
    try {
      window.localStorage.setItem(
        INSERTER_PREFS_KEY,
        JSON.stringify({
          collapsedCategories: state.ui.collapsedCategories,
          lastUsedCategory: state.ui.lastUsedCategory
        })
      );
    } catch (_) {
      // Ignore storage write failures.
    }
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getBlockIconName(type) {
    return iconRegistry.blocks[type] || '';
  }

  function getEditorIconName(key) {
    return iconRegistry.editor[key] || '';
  }

  function getIconSvgMarkup(iconName) {
    switch (iconName) {
      case 'TextParagraph20Regular':
        return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 5.5h12M4 9h12M4 12.5h9M4 16h8"/></svg>';
      case 'TextHeader120Regular':
        return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4v12M15 4v12M5 10h10"/></svg>';
      case 'Code20Regular':
        return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5 4 10l4 5M12 5l4 5-4 5"/></svg>';
      case 'Image20Regular':
        return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="13" height="12" rx="2"/><circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none"/><path d="m6 14 3.2-3 2.4 2 2.4-2.5 2 2.5"/></svg>';
      case 'Video20Regular':
        return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="13" height="11" rx="2"/><path d="M9 8.2v3.6l3.4-1.8L9 8.2Z" fill="currentColor" stroke="none"/></svg>';
      case 'Link20Regular':
        return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12.5 6.5 14a3 3 0 1 1-4.2-4.2L5 7.1M12 7.5 13.5 6a3 3 0 1 1 4.2 4.2L15 12.9M7.5 12.5l5-5"/></svg>';
      case 'LineHorizontal120Regular':
        return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 10h12"/></svg>';
      case 'Tab20Regular':
        return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 6.5h5l1.2 1.5h7v7.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V6.5Z"/><path d="M3.5 6.5v-1a1 1 0 0 1 1-1h3.3L9 6"/></svg>';
      case 'ChevronDown20Regular':
        return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 5 5 5-5"/></svg>';
      case 'ChevronUp20Regular':
        return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5-5 5 5"/></svg>';
      default:
        return '';
    }
  }

  function createIconElement(iconName, fallbackText, className) {
    const icon = createElement('span', className || 'pe-icon');
    icon.setAttribute('aria-hidden', 'true');
    const svgMarkup = getIconSvgMarkup(iconName);
    if (svgMarkup) {
      icon.innerHTML = svgMarkup;
      return icon;
    }

    // No textual/emoji fallbacks; leave empty if registry icon not available.
    icon.innerHTML = '';
    return icon;
  }

  async function loadIconRegistry() {
    try {
      const response = await fetch(getIconRegistryPath(), { cache: 'no-store' });
      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      iconRegistry.blocks = payload && payload.blocks ? payload.blocks : {};
      iconRegistry.editor = payload && payload.editor ? payload.editor : {};
    } catch (_) {
      iconRegistry.blocks = {};
      iconRegistry.editor = {};
    }
  }

  function stripTags(value) {
    return String(value || '').replace(/<[^>]+>/g, '').trim();
  }

  function nextBlockId() {
    const id = 'block-' + nextBlockIdValue;
    nextBlockIdValue += 1;
    return id;
  }

  function createBlock(type) {
    const definition = BLOCK_DEFINITIONS[type];
    if (!definition) {
      throw new Error('Unknown block type: ' + type);
    }

    return {
      id: nextBlockId(),
      type,
      ...definition.create()
    };
  }

  function ensureGridItems(block) {
    if (!block || block.type !== 'grid') {
      return [];
    }

    const desiredCount = Math.max(1, Number(block.columns || 1));
    if (!Array.isArray(block.items)) {
      block.items = [];
    }

    while (block.items.length < desiredCount) {
      block.items.push([]);
    }

    return block.items;
  }

  function assignBlockIds(block) {
    block.id = nextBlockId();
    if (block.type === 'grid' && Array.isArray(block.items)) {
      block.items = block.items.map((item) =>
        Array.isArray(item)
          ? item.map((child) => assignBlockIds(child))
          : []
      );
    }
    return block;
  }

  function cloneBlock(block) {
    const clone = JSON.parse(JSON.stringify(block));
    return assignBlockIds(clone);
  }

  function findBlockLocation(blockId, blocks, parentBlock, itemIndex, depth) {
    const searchBlocks = blocks || state.blocks;
    const currentDepth = depth || 0;

    for (let index = 0; index < searchBlocks.length; index += 1) {
      const block = searchBlocks[index];
      if (block.id === blockId) {
        return {
          block,
          blocks: searchBlocks,
          index,
          parentBlock: parentBlock || null,
          itemIndex: itemIndex === undefined ? null : itemIndex,
          depth: currentDepth
        };
      }

      if (block.type === 'grid') {
        const gridItems = ensureGridItems(block);
        for (let gridItemIndex = 0; gridItemIndex < gridItems.length; gridItemIndex += 1) {
          const childLocation = findBlockLocation(blockId, gridItems[gridItemIndex], block, gridItemIndex, currentDepth + 1);
          if (childLocation) {
            return childLocation;
          }
        }
      }
    }

    return null;
  }

  function getFlatBlockEntries(blocks, depth, entries) {
    const source = blocks || state.blocks;
    const currentDepth = depth || 0;
    const results = entries || [];

    source.forEach((block) => {
      results.push({ block, depth: currentDepth });
      if (block.type === 'grid') {
        ensureGridItems(block).forEach((item) => getFlatBlockEntries(item, currentDepth + 1, results));
      }
    });

    return results;
  }

  function getResolvedPageTitle() {
    return state.page.title.trim() || (isPostEditor() ? 'Untitled post' : 'Untitled page');
  }

  function getDefaultPagePath() {
    if (isPostEditor()) {
      return slugify(getResolvedPageTitle()) || 'untitled-post';
    }
    const slug = slugify(getResolvedPageTitle()) || 'untitled-page';
    return slug + '.html';
  }

  function getResolvedPagePath() {
    if (isPostEditor()) {
      return getResolvedSlug();
    }
    const explicitPath = state.page.path.trim();
    if (explicitPath) {
      let normalized = explicitPath.replace(/^\/+/, '').replace(/^pages\//i, '').replace(/\/+$/, '');
      return normalized.endsWith('.html') ? normalized : normalized.replace(/\/$/, '') + '.html';
    }

    return getDefaultPagePath();
  }

  function getResolvedSlug() {
    if (isPostEditor()) {
      return slugify(state.page.path.trim()) || getDefaultPagePath();
    }
    return getResolvedPagePath().replace(/\.html$/i, '').split('/').pop();
  }

  function isPostEditor() {
    return state.page.kind === 'post';
  }

  function getResolvedPublicPath() {
    return isPostEditor() ? 'blog/' + getResolvedSlug() : getResolvedPagePath();
  }

  function getResolvedSourceBaseName() {
    if (isPostEditor()) {
      return 'post--' + getResolvedSlug();
    }
    return getResolvedPagePath().replace(/\.html$/i, '').replace(/\//g, '--');
  }

  function toRelativeScriptPath(filePath) {
    return String(filePath || '').replace(/^pages\//i, '').replace(/^\/+/, '');
  }

  function serializeHtmlAttributes(attributes) {
    return Object.entries(attributes || {})
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => ' ' + key + '="' + escapeHtml(value) + '"')
      .join('');
  }

  function serializeExternalScripts(items) {
    return Array.isArray(items) && items.length
      ? items.map((src) => '<script src="' + escapeHtml(src) + '"></script>').join('\n')
      : '';
  }

  function serializeExternalStylesheets(items) {
    return Array.isArray(items) && items.length
      ? items.map((href) => '<link rel="stylesheet" href="' + escapeHtml(href) + '" />').join('\n')
      : '';
  }

  function getBlockIndexById(blockId) {
    const location = findBlockLocation(blockId);
    return location ? location.index : -1;
  }

  function getBlockById(blockId) {
    const location = findBlockLocation(blockId);
    return location ? location.block : null;
  }

  function getSelectedBlock() {
    return getBlockById(state.selectedBlockId);
  }

  function cloneHistoryValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function takeHistorySnapshot() {
    return {
      page: cloneHistoryValue(state.page),
      blocks: cloneHistoryValue(state.blocks),
      selectedBlockId: state.selectedBlockId,
      inspectorTab: state.ui.inspectorTab
    };
  }

  function snapshotsMatch(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  function updateHistoryAvailability() {
    state.ui.canUndo = undoStack.length > 0;
    state.ui.canRedo = redoStack.length > 0;
  }

  function pushUndoSnapshot(snapshot) {
    if (!snapshot) {
      return;
    }

    const previous = undoStack[undoStack.length - 1];
    if (previous && snapshotsMatch(snapshot, previous)) {
      return;
    }

    undoStack.push(snapshot);
    if (undoStack.length > 100) {
      undoStack.shift();
    }
    redoStack.length = 0;
    updateHistoryAvailability();
  }

  function beginHistoryCapture() {
    if (!pendingHistorySnapshot) {
      pendingHistorySnapshot = takeHistorySnapshot();
    }
  }

  function commitHistoryCapture() {
    if (!pendingHistorySnapshot) {
      return;
    }

    if (snapshotsMatch(pendingHistorySnapshot, takeHistorySnapshot())) {
      pendingHistorySnapshot = null;
      return;
    }

    pushUndoSnapshot(pendingHistorySnapshot);
    pendingHistorySnapshot = null;
  }

  function restoreHistorySnapshot(snapshot) {
    if (!snapshot) {
      return;
    }

    state.page = cloneHistoryValue(snapshot.page);
    state.blocks = cloneHistoryValue(snapshot.blocks);
    state.selectedBlockId = snapshot.selectedBlockId;
    state.ui.inspectorTab = snapshot.inspectorTab || state.ui.inspectorTab;
    state.ui.dirty = true;
    renderInserter();
    renderCanvas();
  }

  function undoLastChange() {
    commitHistoryCapture();
    if (!undoStack.length) {
      return;
    }

    const previous = undoStack.pop();
    redoStack.push(takeHistorySnapshot());
    updateHistoryAvailability();
    restoreHistorySnapshot(previous);
    state.ui.statusMessage = 'Undid last change';
    renderChrome();
  }

  function redoLastChange() {
    commitHistoryCapture();
    if (!redoStack.length) {
      return;
    }

    const next = redoStack.pop();
    undoStack.push(takeHistorySnapshot());
    updateHistoryAvailability();
    restoreHistorySnapshot(next);
    state.ui.statusMessage = 'Redid last change';
    renderChrome();
  }

  function markDirty() {
    state.ui.dirty = true;
    state.ui.statusMessage = 'Unsaved changes';
    renderChrome();
  }

  function setFlashMessage(message, isError) {
    state.ui.flashMessage = message || '';
    state.ui.flashError = !!isError;
    renderChrome();
  }

  function clearFlashMessage() {
    if (!state.ui.flashMessage && !state.ui.flashError) {
      return;
    }
    state.ui.flashMessage = '';
    state.ui.flashError = false;
    renderChrome();
  }

  function setStatus(message) {
    state.ui.statusMessage = message || '';
    renderChrome();
  }

  function syncPathIfNeeded() {
    if (!state.page.pathEdited) {
      state.page.path = getDefaultPagePath();
    }
  }

  function selectBlock(blockId, options) {
    const nextId = blockId || null;
    const shouldSwitchInspector = !options || options.switchInspector !== false;
    state.selectedBlockId = nextId;
    if (shouldSwitchInspector && nextId) {
      state.ui.inspectorTab = 'block';
    }
    syncSelectionState();
    renderOverview();
    renderInspector();
    renderChrome();
  }

  function syncSelectionState() {
    const selectedId = state.selectedBlockId;
    const blockElements = Array.from(elements.canvas.querySelectorAll('.pe-block'));
    blockElements.forEach((blockElement) => {
      blockElement.classList.toggle('is-selected', blockElement.dataset.blockId === selectedId);
    });
  }

  function buildAuthHeaders(includeJson) {
    const headers = {};

    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }

    if (isLocalHost) {
      return Promise.resolve(headers);
    }

    if (!window.SiteAuth) {
      return Promise.reject(new Error('Site authentication is not available on this page.'));
    }

    return window.SiteAuth.getIdToken()
      .catch(() => {
        throw new Error('Sign in from the site header before managing pages or images.');
      })
      .then((idToken) => {
        headers.Authorization = 'Bearer ' + idToken;
        headers['x-site-id-token'] = idToken;
        return headers;
      });
  }

  async function apiRequest(path, options) {
    const requestOptions = options || {};
    const headers = await buildAuthHeaders(!!requestOptions.includeJson);
    const response = await fetch(API_BASE + path, {
      method: requestOptions.method || 'GET',
      headers,
      body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined
    });

    const body = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Sign in from the site header before managing pages or images.');
    }

    if (!response.ok) {
      throw new Error(body.error || ('Request failed with status ' + response.status + '.'));
    }

    return body;
  }

  function createElement(tagName, className, textContent) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (textContent !== undefined) {
      element.textContent = textContent;
    }
    return element;
  }

  function createRichTextBlockContent(block, options) {
    const editor = createElement('div', 'pe-richtext pe-content');
    editor.contentEditable = 'true';
    editor.dataset.placeholder = options.placeholder;
    editor.dataset.blockId = block.id;
    editor.dataset.role = options.role;
    editor.innerHTML = options.html;
    if (options.role === 'heading') {
      editor.setAttribute('aria-label', 'Heading text');
      editor.dataset.level = String(block.level || 2);
      editor.classList.add('pe-heading-level-' + String(block.level || 2));
    }
    editor.addEventListener('focus', () => {
      selectBlock(block.id);
    });
    editor.addEventListener('input', () => {
      if (options.role === 'paragraph') {
        block.html = editor.innerHTML;
      } else {
        block.text = editor.innerHTML;
      }
      markDirty();
    });
    editor.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && options.role === 'paragraph') {
        event.preventDefault();
        insertBlockAfter(block.id, 'paragraph', true);
      }
    });
    return editor;
  }

  function createToolbarButton(label, action, title) {
    const button = createElement('button', 'pe-block-action', label);
    button.type = 'button';
    button.dataset.action = action;
    button.title = title || label;
    return button;
  }

  function getAlignmentOptions(block) {
    if (!block) {
      return ['left', 'center'];
    }

    switch (block.type) {
      case 'paragraph':
        return ['left', 'center', 'right', 'justify'];
      case 'heading':
        return ['left', 'center', 'right'];
      case 'image':
      case 'video':
      case 'embed':
      case 'hero':
        return ['left', 'center', 'right', 'wide', 'full'];
      case 'separator':
      case 'group':
      case 'code':
      case 'divider':
      case 'card':
      case 'callout':
      case 'background':
      case 'columns':
      case 'grid':
      case 'row':
      case 'accordion':
      case 'spacer':
        return ['left', 'wide', 'full'];
      case 'button':
      case 'icon':
        return ['left', 'center', 'right'];
      default:
        return ['left', 'center'];
    }
  }

  function applyCustomClassName(element, className) {
    if (!element || !className) {
      return;
    }

    String(className)
      .split(/\s+/)
      .filter(Boolean)
      .forEach((name) => element.classList.add(name));
  }

  function applyBlockPresentation(element, block) {
    if (!element || !block) {
      return;
    }

    if (block.type === 'group') {
      if (block.backgroundColor) {
        element.style.backgroundColor = block.backgroundColor;
      }
      if (block.textColor) {
        element.style.color = block.textColor;
      }
      if (block.padding) {
        element.style.padding = block.padding;
      }
      if (block.margin) {
        element.style.margin = block.margin;
      }
    }
  }

  function getNamedIconSymbol(name) {
    switch (String(name || '').toLowerCase()) {
      case 'check':
        return '✓';
      case 'info':
        return 'i';
      case 'warning':
        return '!';
      case 'error':
        return '×';
      case 'spark':
        return '✦';
      case 'arrow':
        return '→';
      case 'heart':
        return '♥';
      default:
        return '★';
    }
  }

  function createSerializedPreviewBlockContent(block) {
    const content = createElement('div', 'pe-content');
    content.innerHTML = serializeBlock(block);
    content.addEventListener('click', (event) => {
      const actionable = event.target.closest('a');
      if (actionable) {
        event.preventDefault();
      }
      selectBlock(block.id, { switchInspector: false });
    });
    return content;
  }

  function createGridBlockContent(block) {
    const content = createElement('div', 'pe-content pe-grid-editor');
    const summary = createElement('p', 'pe-small', block.text || 'Each grid container can hold other blocks.');
    content.appendChild(summary);

    const columnCount = Math.max(1, Number(block.columns || 1));
    const gridItems = ensureGridItems(block);
    const grid = createElement('div', 'pe-grid-editor-layout');
    grid.style.gridTemplateColumns = 'repeat(' + columnCount + ', minmax(' + (block.minWidth || '180px') + ', 1fr))';
    grid.style.gap = block.gap || '20px';

    for (let cellIndex = 0; cellIndex < columnCount; cellIndex += 1) {
      const cell = createElement('section', 'pe-grid-editor-cell');
      const header = createElement('div', 'pe-grid-editor-cell-header');
      header.appendChild(createElement('strong', '', 'Container ' + String(cellIndex + 1)));
      const count = Array.isArray(gridItems[cellIndex]) ? gridItems[cellIndex].length : 0;
      header.appendChild(createElement('span', 'pe-small', count ? String(count) + ' blocks' : 'Empty'));
      cell.appendChild(header);

      const list = createElement('div', 'pe-grid-editor-cell-list');
      const childBlocks = Array.isArray(gridItems[cellIndex]) ? gridItems[cellIndex] : [];

      if (!childBlocks.length) {
        const emptyState = createElement('div', 'pe-grid-editor-empty');
        emptyState.appendChild(createElement('p', 'pe-small', 'Add a block to this container.'));
        const addButton = createElement('button', '', 'Add block');
        addButton.type = 'button';
        addButton.addEventListener('click', (event) => {
          openInsertMenu(
            {
              kind: 'grid-cell',
              parentBlockId: block.id,
              itemIndex: cellIndex,
              index: 0
            },
            event.currentTarget
          );
        });
        emptyState.appendChild(addButton);
        list.appendChild(emptyState);
      } else {
        childBlocks.forEach((childBlock, childIndex) => {
          const insertBefore = createElement('div', 'pe-insert-between pe-insert-between-nested');
          const insertButton = createElement('button', 'pe-insert-btn', '+');
          insertButton.type = 'button';
          insertButton.title = 'Insert block here';
          insertButton.addEventListener('click', (event) => {
            openInsertMenu(
              {
                kind: 'grid-cell',
                parentBlockId: block.id,
                itemIndex: cellIndex,
                index: childIndex
              },
              event.currentTarget
            );
          });
          insertBefore.appendChild(insertButton);
          list.appendChild(insertBefore);
          list.appendChild(createBlockElement(childBlock, childIndex));
        });

        const insertAfter = createElement('div', 'pe-insert-between pe-insert-between-nested');
        const insertButton = createElement('button', 'pe-insert-btn', '+');
        insertButton.type = 'button';
        insertButton.title = 'Insert block here';
        insertButton.addEventListener('click', (event) => {
          openInsertMenu(
            {
              kind: 'grid-cell',
              parentBlockId: block.id,
              itemIndex: cellIndex,
              index: childBlocks.length
            },
            event.currentTarget
          );
        });
        insertAfter.appendChild(insertButton);
        list.appendChild(insertAfter);
      }

      cell.appendChild(list);
      grid.appendChild(cell);
    }

    content.appendChild(grid);
    return content;
  }

  function createDrawerBlockContent(block) {
    const content = createElement('div', 'pe-content pe-drawer-editor');
    const attrs = block.attrs || {};

    const summary = createElement('p', 'pe-small', 'Drawer (' + (attrs.position || 'right') + ')');
    content.appendChild(summary);

    const triggerPreview = createElement('div', 'pe-drawer-trigger-preview');
    const triggerBtn = createElement('button', 'pe-btn', (attrs.trigger && attrs.trigger.label) ? attrs.trigger.label : 'Open drawer');
    triggerBtn.type = 'button';
    triggerPreview.appendChild(triggerBtn);
    content.appendChild(triggerPreview);

    const editButton = createElement('button', 'pe-btn pe-btn-secondary', 'Edit drawer');
    editButton.type = 'button';
    editButton.addEventListener('click', () => {
      // open a simple overlay editor for nested children
      const overlay = createElement('div', 'pe-drawer-editor-overlay');
      const box = createElement('div', 'pe-drawer-editor-box');
      const hdr = createElement('header', 'pe-drawer-editor-header');
      hdr.appendChild(createElement('h3', '', 'Edit Drawer')); 
      const closeBtn = createElement('button', 'pe-btn pe-btn-ghost', 'Close');
      closeBtn.type = 'button';
      hdr.appendChild(closeBtn);
      box.appendChild(hdr);

      const list = createElement('div', 'pe-drawer-editor-list');

      // local mutable copy of children
      let children = Array.isArray(attrs.children) ? JSON.parse(JSON.stringify(attrs.children)) : [];

      function renderList() {
        list.innerHTML = '';
        if (!children.length) {
          list.appendChild(createElement('p', 'pe-small', 'No blocks inside the drawer.'));
        }
        children.forEach((child, idx) => {
          const item = createElement('div', 'pe-drawer-child');
          item.appendChild(createElement('div', 'pe-drawer-child-index', String(idx + 1)));
          item.appendChild(createBlockElement(child, idx));
          const controls = createElement('div', 'pe-drawer-child-controls');
          const up = createElement('button', '', '↑'); up.type = 'button';
          const down = createElement('button', '', '↓'); down.type = 'button';
          const del = createElement('button', '', 'Delete'); del.type = 'button';
          up.addEventListener('click', () => { if (idx>0){ const t = children[idx-1]; children[idx-1]=children[idx]; children[idx]=t; renderList(); }});
          down.addEventListener('click', () => { if (idx<children.length-1){ const t = children[idx+1]; children[idx+1]=children[idx]; children[idx]=t; renderList(); }});
          del.addEventListener('click', () => { children.splice(idx,1); renderList(); });
          controls.appendChild(up); controls.appendChild(down); controls.appendChild(del);
          item.appendChild(controls);
          list.appendChild(item);
        });

        const addBar = createElement('div', 'pe-drawer-addbar');
        const addBtn = createElement('button', '', 'Add block'); addBtn.type = 'button';
        addBtn.addEventListener('click', (e) => {
          // show simple picker
          const menu = createElement('div', 'pe-insert-menu');
          const insertTargetIndex = children.length;
          BLOCK_ORDER.forEach((type) => {
            const def = BLOCK_DEFINITIONS[type];
            const b = createElement('button', 'pe-insert-menu-item'); b.type='button';
            b.appendChild(createElement('strong','',def.label));
            b.addEventListener('click', () => {
              const newBlock = (BLOCK_DEFINITIONS[type] && typeof BLOCK_DEFINITIONS[type].create === 'function') ? BLOCK_DEFINITIONS[type].create() : { id: null, type };
              if (!newBlock.id) newBlock.id = nextBlockId();
              children.splice(insertTargetIndex,0,newBlock);
              document.body.removeChild(menu);
              renderList();
            });
            menu.appendChild(b);
          });
          document.body.appendChild(menu);
          const rect = e.currentTarget.getBoundingClientRect();
          menu.style.position = 'absolute'; menu.style.top = (rect.bottom + window.scrollY + 8) + 'px'; menu.style.left = (rect.left + window.scrollX) + 'px';
          setTimeout(()=> document.addEventListener('click', function onDoc(e2){ if (!menu.contains(e2.target)){ document.body.removeChild(menu); document.removeEventListener('click', onDoc); }}),0);
        });
        addBar.appendChild(addBtn);
        list.appendChild(addBar);
      }

      renderList();

      const actions = createElement('div', 'pe-drawer-editor-actions');
      const saveBtn = createElement('button', 'pe-btn pe-btn-primary', 'Save'); saveBtn.type='button';
      actions.appendChild(saveBtn);
      box.appendChild(list);
      box.appendChild(actions);
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      closeBtn.addEventListener('click', () => { if (document.body.contains(overlay)) document.body.removeChild(overlay); });
      saveBtn.addEventListener('click', () => {
        if (window.EditorCore) EditorCore.setBlockAttrs(block.id, { children: children });
        markDirty();
        renderCanvas();
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
      });
    });

    content.appendChild(editButton);
    return content;
  }

  function createSearchResultsBlockContent(block) {
    const content = createElement('div', 'pe-content pe-search-results-editor');

    // Settings panel
    const settings = createElement('div', 'pe-search-settings');
    const dsLabel = createElement('label', '', 'Data source (API or index)');
    const dsInput = createElement('input', 'pe-search-datasource');
    dsInput.value = block.dataSource || '';
    dsInput.placeholder = '/api/search.json';
    dsInput.addEventListener('input', () => {
      block.dataSource = dsInput.value;
      markDirty();
    });
    settings.appendChild(dsLabel);
    settings.appendChild(dsInput);

    const row = createElement('div', 'row');
    const colLabel = createElement('label', '', 'Columns');
    const colSelect = createElement('select');
    [1,2,3,4,5,6].forEach(n => {
      const opt = createElement('option', '', String(n));
      opt.value = String(n);
      if (Number(block.columns || 3) === n) opt.selected = true;
      colSelect.appendChild(opt);
    });
    colSelect.addEventListener('change', () => {
      block.columns = Number(colSelect.value);
      markDirty();
      renderPreview();
    });
    row.appendChild(colLabel);
    row.appendChild(colSelect);

    const pageSizeLabel = createElement('label', '', 'Page size');
    const pageSizeInput = createElement('input');
    pageSizeInput.type = 'number';
    pageSizeInput.min = 1;
    pageSizeInput.value = block.pageSize || 6;
    pageSizeInput.addEventListener('input', () => {
      block.pageSize = Number(pageSizeInput.value || 6);
      markDirty();
      renderPreview();
    });
    row.appendChild(pageSizeLabel);
    row.appendChild(pageSizeInput);

    settings.appendChild(row);

    const toggles = createElement('div', 'pe-search-toggles');
    const showMod = createElement('label');
    const showModChk = createElement('input');
    showModChk.type = 'checkbox';
    showModChk.checked = !!block.showModified;
    showModChk.addEventListener('change', () => { block.showModified = showModChk.checked; markDirty(); renderPreview(); });
    showMod.appendChild(showModChk);
    showMod.appendChild(createElement('span', '', ' Show modified date'));
    toggles.appendChild(showMod);

    const showContrib = createElement('label');
    const showContribChk = createElement('input');
    showContribChk.type = 'checkbox';
    showContribChk.checked = !!block.showContributors;
    showContribChk.addEventListener('change', () => { block.showContributors = showContribChk.checked; markDirty(); renderPreview(); });
    showContrib.appendChild(showContribChk);
    showContrib.appendChild(createElement('span', '', ' Show contributors'));
    toggles.appendChild(showContrib);

    settings.appendChild(toggles);
    content.appendChild(settings);

    // Preview grid
    const preview = createElement('div', 'pe-search-preview');

    function buildCardSample(i) {
      const card = createElement('article', 'search-card');
      card.appendChild(createElement('div', 'search-card-thumb')); // CSS handles background placeholder
      const title = createElement('h3', 'search-card-title');
      const a = createElement('a');
      a.href = '#';
      a.textContent = 'Sample result title ' + (i + 1);
      title.appendChild(a);
      card.appendChild(title);
      const meta = createElement('div', 'search-card-meta');
      if (block.showModified) meta.appendChild(createElement('div', 'search-card-modified', 'Modified on 25 May 2026'));
      if (block.showContributors) {
        const avatars = createElement('div', 'search-card-avatars');
        for (let j = 0; j < 3; j++) {
          const img = createElement('img', 'search-avatar');
          img.src = '/images/avatar-placeholder.png';
          img.alt = '';
          avatars.appendChild(img);
        }
        meta.appendChild(avatars);
      }
      card.appendChild(meta);
      return card;
    }

    function renderPreview() {
      preview.innerHTML = '';
      const cols = Math.max(1, Number(block.columns || 3));
      preview.className = 'pe-search-preview search-results-grid columns-' + String(cols);
      const count = Math.max(1, Number(block.pageSize || 6));
      for (let i = 0; i < count; i++) {
        preview.appendChild(buildCardSample(i));
      }
    }

    renderPreview();
    content.appendChild(preview);

    return content;
  }

  function createImagePreview(src) {
    const preview = createElement('div', 'pe-image-preview');
    if (!src) {
      preview.appendChild(createElement('div', 'pe-image-empty', 'Choose an image to preview it here.'));
      return preview;
    }

    const image = createElement('img');
    image.src = src;
    image.alt = '';
    preview.appendChild(image);
    return preview;
  }

  function updateImagePreview(previewElement, src) {
    if (!previewElement) {
      return;
    }

    previewElement.innerHTML = '';
    if (!src) {
      previewElement.appendChild(createElement('div', 'pe-image-empty', 'Choose an image to preview it here.'));
      return;
    }

    const image = createElement('img');
    image.src = src;
    image.alt = '';
    previewElement.appendChild(image);
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error || new Error('Could not read the image file.'));
      reader.onload = () => {
        const result = String(reader.result || '');
        const separatorIndex = result.indexOf(',');
        resolve(separatorIndex >= 0 ? result.slice(separatorIndex + 1) : result);
      };
      reader.readAsDataURL(file);
    });
  }

  function applyImageToBlock(blockId, src, message) {
    const block = getBlockById(blockId);
    if (!block) {
      return;
    }

    block.src = src;
    selectBlock(blockId);
    renderCanvas();
    if (message) {
      setFlashMessage(message, false);
    }
    state.ui.statusMessage = '';
    markDirty();
  }

  async function uploadImageFile(file, blockId) {
    if (!file) {
      return;
    }

    setStatus('Uploading image...');
    clearFlashMessage();

    try {
      const base64Content = await fileToBase64(file);
      const result = await apiRequest(IMAGE_UPLOAD_PATH, {
        method: 'POST',
        includeJson: true,
        body: {
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          base64Content
        }
      });

      applyImageToBlock(blockId, result.urlPath, 'Uploaded image to /images and applied it to the block.');
    } catch (error) {
      setStatus('');
      setFlashMessage(error.message || 'Could not upload the image.', true);
    }
  }

  function createImageBlockContent(block) {
    const content = createElement('div', 'pe-content pe-media-content');
    const sourceField = createElement('label', 'pe-image-field');
    sourceField.appendChild(createElement('span', 'pe-small', 'Image source'));

    const sourceInput = createElement('input');
    sourceInput.type = 'url';
    sourceInput.placeholder = '/images/example.png';
    sourceInput.value = block.src || '';
    sourceInput.addEventListener('focus', () => selectBlock(block.id));
    sourceInput.addEventListener('input', () => {
      block.src = sourceInput.value;
      updateImagePreview(preview, block.src);
      markDirty();
    });
    sourceField.appendChild(sourceInput);
    content.appendChild(sourceField);

    const actions = createElement('div', 'pe-image-actions');
    const uploadButton = createElement('button', '', 'Upload image');
    uploadButton.type = 'button';
    const libraryButton = createElement('button', 'secondary', 'Choose from library');
    libraryButton.type = 'button';

    const fileInput = createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/avif,image/gif,image/jpeg,image/png,image/svg+xml,image/webp';
    fileInput.hidden = true;
    fileInput.addEventListener('change', async () => {
      const selectedFile = fileInput.files && fileInput.files[0];
      await uploadImageFile(selectedFile, block.id);
      fileInput.value = '';
    });

    uploadButton.addEventListener('click', () => fileInput.click());
    libraryButton.addEventListener('click', () => openImageLibrary(block.id));

    actions.appendChild(uploadButton);
    actions.appendChild(libraryButton);
    actions.appendChild(fileInput);
    content.appendChild(actions);
    content.appendChild(createElement('p', 'pe-small pe-image-help', 'Upload adds a file to /images. Library lets you reuse images already in the container.'));

    const preview = createImagePreview(block.src);
    content.appendChild(preview);

    return content;
  }

  function createVideoBlockContent(block) {
    const content = createElement('div', 'pe-content pe-media-content');

    const sourceField = createElement('label', 'pe-image-field');
    sourceField.appendChild(createElement('span', 'pe-small', 'Video source'));
    const sourceInput = createElement('input');
    sourceInput.type = 'url';
    sourceInput.placeholder = 'https://example.com/video.mp4';
    sourceInput.value = block.src || '';
    sourceInput.addEventListener('focus', () => selectBlock(block.id));
    sourceInput.addEventListener('input', () => {
      block.src = sourceInput.value;
      markDirty();
      renderPreviewHint();
    });
    sourceField.appendChild(sourceInput);
    content.appendChild(sourceField);

    const captionField = createElement('label', 'pe-image-field');
    captionField.appendChild(createElement('span', 'pe-small', 'Caption'));
    const captionInput = createElement('textarea');
    captionInput.rows = 3;
    captionInput.placeholder = 'Optional caption';
    captionInput.value = block.caption || '';
    captionInput.addEventListener('focus', () => selectBlock(block.id));
    captionInput.addEventListener('input', () => {
      block.caption = captionInput.value;
      markDirty();
    });
    captionField.appendChild(captionInput);
    content.appendChild(captionField);

    if (block.src) {
      const preview = createElement('div', 'pe-image-preview');
      const video = createElement('video');
      video.controls = true;
      video.src = block.src;
      preview.appendChild(video);
      content.appendChild(preview);
    }

    return content;
  }

  function createCodeBlockContent(block) {
    const content = createElement('div', 'pe-content');
    const textarea = createElement('textarea', 'pe-code-editor');
    textarea.rows = 8;
    textarea.placeholder = 'Write code...';
    textarea.value = block.code || '';
    textarea.addEventListener('focus', () => selectBlock(block.id));
    textarea.addEventListener('input', () => {
      block.code = textarea.value;
      markDirty();
    });
    content.appendChild(textarea);
    return content;
  }

  function createEmbedBlockContent(block) {
    const content = createElement('div', 'pe-content pe-media-content');

    const urlField = createElement('label', 'pe-image-field');
    urlField.appendChild(createElement('span', 'pe-small', 'Embed source URL'));
    const urlInput = createElement('input');
    urlInput.type = 'url';
    urlInput.placeholder = 'https://example.com/embed';
    urlInput.value = block.url || '';
    urlInput.addEventListener('focus', () => selectBlock(block.id));
    urlInput.addEventListener('input', () => {
      block.url = urlInput.value;
      markDirty();
    });
    urlField.appendChild(urlInput);
    content.appendChild(urlField);

    const htmlField = createElement('label', 'pe-image-field');
    htmlField.appendChild(createElement('span', 'pe-small', 'Trusted embed HTML'));
    const htmlInput = createElement('textarea');
    htmlInput.rows = 6;
    htmlInput.placeholder = '<iframe ...></iframe>';
    htmlInput.value = block.html || '';
    htmlInput.addEventListener('focus', () => selectBlock(block.id));
    htmlInput.addEventListener('input', () => {
      block.html = htmlInput.value;
      markDirty();
    });
    htmlField.appendChild(htmlInput);
    content.appendChild(htmlField);

    content.appendChild(createElement('p', 'pe-small', 'Embed HTML is written directly into preview and saved output. Only use trusted embed snippets.'));
    return content;
  }

  function createSeparatorBlockContent(block) {
    const content = createElement('div', 'pe-content');
    const preview = createElement('div', 'pe-separator-preview');
    preview.appendChild(createElement('hr'));
    content.appendChild(preview);
    content.appendChild(createElement('p', 'pe-small', 'Use the inspector to change alignment or keep this as a simple divider.'));
    content.addEventListener('click', () => selectBlock(block.id));
    return content;
  }

  function createGroupBlockContent(block) {
    const content = createElement('div', 'pe-content pe-group-editor');

    const titleField = createElement('label', 'pe-image-field');
    titleField.appendChild(createElement('span', 'pe-small', 'Group heading'));
    const titleInput = createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Section heading';
    titleInput.value = block.title || '';
    titleInput.addEventListener('focus', () => selectBlock(block.id));
    titleInput.addEventListener('input', () => {
      block.title = titleInput.value;
      markDirty();
    });
    titleField.appendChild(titleInput);
    content.appendChild(titleField);

    const bodyField = createElement('label', 'pe-image-field');
    bodyField.appendChild(createElement('span', 'pe-small', 'Group body'));
    const bodyInput = createElement('textarea');
    bodyInput.rows = 5;
    bodyInput.placeholder = 'Add grouped section copy';
    bodyInput.value = block.text || '';
    bodyInput.addEventListener('focus', () => selectBlock(block.id));
    bodyInput.addEventListener('input', () => {
      block.text = bodyInput.value;
      markDirty();
    });
    bodyField.appendChild(bodyInput);
    content.appendChild(bodyField);

    return content;
  }

  function createBlockElement(block, index) {
    const definition = BLOCK_DEFINITIONS[block.type];
    const wrapper = createElement('article', 'pe-block pe-block-' + block.type);
    wrapper.dataset.blockId = block.id;
    wrapper.dataset.blockType = block.type;
    wrapper.setAttribute('role', 'listitem');
    wrapper.tabIndex = -1;
    wrapper.classList.add('pe-align-' + (block.align || 'left'));
    applyCustomClassName(wrapper, block.className);
    applyBlockPresentation(wrapper, block);

    wrapper.addEventListener('mousedown', (event) => {
      event.stopPropagation();
      selectBlock(block.id, { switchInspector: false });
    });

    const header = createElement('header', 'pe-block-header');
    const meta = createElement('div', 'pe-block-meta');
    meta.appendChild(createIconElement(getBlockIconName(block.type), definition.fallbackIcon, 'pe-block-icon'));
    meta.appendChild(createElement('div', 'pe-block-title', definition.label));
    meta.appendChild(createElement('span', 'pe-block-position', String(index + 1)));
    header.appendChild(meta);

    const actions = createElement('div', 'pe-block-toolbar');
    actions.appendChild(createToolbarButton('Up', 'move-up', 'Move block up'));
    actions.appendChild(createToolbarButton('Down', 'move-down', 'Move block down'));
    actions.appendChild(createToolbarButton('Duplicate', 'duplicate', 'Duplicate block'));
    if (block.type === 'paragraph' || block.type === 'heading') {
      actions.appendChild(createToolbarButton('Bold', 'bold', 'Bold'));
      actions.appendChild(createToolbarButton('Italic', 'italic', 'Italic'));
    }
    actions.appendChild(createToolbarButton('Delete', 'delete', 'Delete block'));
    header.appendChild(actions);
    wrapper.appendChild(header);

    let content;
    switch (block.type) {
      case 'paragraph':
        content = createRichTextBlockContent(block, {
          role: 'paragraph',
          placeholder: 'Write a paragraph...',
          html: block.html || ''
        });
        break;
      case 'heading':
        content = createRichTextBlockContent(block, {
          role: 'heading',
          placeholder: 'Add heading text...',
          html: block.text || ''
        });
        break;
      case 'image':
        content = createImageBlockContent(block);
        break;
      case 'video':
        content = createVideoBlockContent(block);
        break;
      case 'code':
        content = createCodeBlockContent(block);
        break;
      case 'embed':
        content = createEmbedBlockContent(block);
        break;
      case 'separator':
        content = createSeparatorBlockContent(block);
        break;
      case 'group':
        content = createGroupBlockContent(block);
        break;
      case 'button':
      case 'spacer':
      case 'divider':
      case 'card':
      case 'hero':
      case 'icon':
      case 'callout':
      case 'background':
      case 'columns':
      case 'row':
      case 'accordion':
        content = createSerializedPreviewBlockContent(block);
        break;
      case 'grid':
        content = createGridBlockContent(block);
        break;
      case 'drawer':
        content = createDrawerBlockContent(block);
        break;
      case 'search-results':
        content = createSearchResultsBlockContent(block);
        break;
      default:
        content = createElement('div', 'pe-content', 'Unsupported block type');
        break;
    }

    wrapper.appendChild(content);
    return wrapper;
  }

  function closeInsertMenu() {
    if (activeInsertMenu && document.body.contains(activeInsertMenu)) {
      document.body.removeChild(activeInsertMenu);
    }
    activeInsertMenu = null;
  }

  function openInsertMenu(target, anchor) {
    closeInsertMenu();
    const menu = createElement('div', 'pe-insert-menu');
    menu.setAttribute('role', 'menu');
    const insertTarget = typeof target === 'number' ? { kind: 'root', index: target } : target;

    BLOCK_ORDER.forEach((type) => {
      const definition = BLOCK_DEFINITIONS[type];
      const button = createElement('button', 'pe-insert-menu-item');
      button.type = 'button';
      button.appendChild(createIconElement(getBlockIconName(type), definition.fallbackIcon, 'pe-block-icon'));
      const copy = createElement('span');
      copy.appendChild(createElement('strong', '', definition.label));
      copy.appendChild(createElement('span', 'pe-menu-description', definition.description));
      button.appendChild(copy);
      button.addEventListener('click', () => {
        insertBlockAtTarget(insertTarget, type, true);
        closeInsertMenu();
      });
      menu.appendChild(button);
    });

    document.body.appendChild(menu);
    activeInsertMenu = menu;

    const rect = anchor.getBoundingClientRect();
    menu.style.top = String(rect.bottom + window.scrollY + 8) + 'px';
    menu.style.left = String(Math.max(16, rect.left + window.scrollX)) + 'px';

    setTimeout(() => {
      document.addEventListener('click', handleInsertMenuDismiss, { once: true });
    }, 0);
  }

  function handleInsertMenuDismiss(event) {
    if (activeInsertMenu && activeInsertMenu.contains(event.target)) {
      document.addEventListener('click', handleInsertMenuDismiss, { once: true });
      return;
    }
    closeInsertMenu();
  }

  function renderCanvas() {
    elements.canvas.innerHTML = '';

    if (!state.blocks.length) {
      const emptyState = createElement('div', 'pe-empty-canvas');
      emptyState.appendChild(createElement('h2', '', 'Start building your page'));
      emptyState.appendChild(createElement('p', 'pe-small', 'Use the inserter or add a block below to start composing the page.'));
      const addButton = createElement('button', '', 'Add your first block');
      addButton.type = 'button';
      addButton.addEventListener('click', (event) => openInsertMenu(0, event.currentTarget));
      emptyState.appendChild(addButton);
      elements.canvas.appendChild(emptyState);
      syncSelectionState();
      renderOverview();
      renderInspector();
      renderChrome();
      return;
    }

    state.blocks.forEach((block, index) => {
      const insertBefore = createElement('div', 'pe-insert-between');
      const insertButton = createElement('button', 'pe-insert-btn', '+');
      insertButton.type = 'button';
      insertButton.title = 'Insert block here';
      insertButton.addEventListener('click', (event) => openInsertMenu(index, event.currentTarget));
      insertBefore.appendChild(insertButton);
      elements.canvas.appendChild(insertBefore);
      elements.canvas.appendChild(createBlockElement(block, index));
    });

    const insertAfter = createElement('div', 'pe-insert-between');
    const insertButton = createElement('button', 'pe-insert-btn', '+');
    insertButton.type = 'button';
    insertButton.title = 'Insert block here';
    insertButton.addEventListener('click', (event) => openInsertMenu(state.blocks.length, event.currentTarget));
    insertAfter.appendChild(insertButton);
    elements.canvas.appendChild(insertAfter);

    syncSelectionState();
    renderOverview();
    renderInspector();
    renderChrome();
  }

  function renderInserter() {
    const query = state.ui.inserterQuery.trim().toLowerCase();
    const groups = {};

    BLOCK_ORDER.forEach((type) => {
      const definition = BLOCK_DEFINITIONS[type];
      const matches =
        !query ||
        definition.label.toLowerCase().includes(query) ||
        definition.category.toLowerCase().includes(query) ||
        definition.description.toLowerCase().includes(query);

      if (!matches) {
        return;
      }

      if (!groups[definition.category]) {
        groups[definition.category] = [];
      }
      groups[definition.category].push({ type, definition });
    });

    elements.blockGroups.innerHTML = '';
    const categories = Object.keys(groups);

    if (!categories.length) {
      elements.blockGroups.appendChild(createElement('p', 'pe-small', 'No blocks match the current search.'));
      return;
    }

    categories.forEach((category) => {
      const group = createElement('section', 'pe-block-group');
      const items = groups[category];
      const isCollapsed = state.ui.collapsedCategories.includes(category);
      const titleButton = createElement('button', 'pe-block-group-toggle');
      titleButton.type = 'button';
      titleButton.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      const heading = createElement('span', 'pe-block-group-heading');
      heading.appendChild(createElement('span', 'pe-block-group-title', category));
      heading.appendChild(createElement('span', 'pe-block-group-count', String(items.length)));
      titleButton.appendChild(heading);
      titleButton.appendChild(
        createIconElement(
          getEditorIconName(isCollapsed ? 'expand' : 'collapse'),
          isCollapsed ? '+' : '-',
          'pe-block-group-chevron'
        )
      );
      titleButton.addEventListener('click', () => {
        if (state.ui.collapsedCategories.includes(category)) {
          state.ui.collapsedCategories = state.ui.collapsedCategories.filter((value) => value !== category);
        } else {
          state.ui.collapsedCategories = state.ui.collapsedCategories.concat(category);
        }
        saveInserterPrefs();
        renderInserter();
      });
      group.appendChild(titleButton);

      const list = createElement('div', 'pe-block-palette');
      list.hidden = isCollapsed;
      items.forEach(({ type, definition }) => {
        const button = createElement('button', 'pe-block-picker-card');
        button.type = 'button';
        button.dataset.type = type;
        button.title = definition.description;
        button.appendChild(createIconElement(getBlockIconName(type), definition.fallbackIcon, 'pe-picker-icon'));
        const copy = createElement('span', 'pe-block-picker-copy');
        copy.appendChild(createElement('strong', '', definition.label));
        copy.appendChild(createElement('small', '', definition.description));
        button.appendChild(copy);
        button.addEventListener('click', () => {
          state.ui.lastUsedCategory = definition.category;
          saveInserterPrefs();
          insertBlockAt(state.blocks.length, type, true);
        });
        list.appendChild(button);
      });

      group.appendChild(list);
      elements.blockGroups.appendChild(group);
    });
  }

  function getBlockOverviewLabel(block) {
    switch (block.type) {
      case 'paragraph':
        return stripTags(block.html || '') || 'Empty paragraph';
      case 'heading':
        return stripTags(block.text || '') || 'Heading';
      case 'image':
        return block.alt || block.caption || block.src || 'Image';
      case 'video':
        return block.caption || block.src || 'Video';
      case 'embed':
        return block.provider || block.url || 'Embed';
      case 'group':
        return block.title || 'Group';
      case 'button':
        return block.text || 'Button';
      case 'spacer':
        return block.height || 'Spacer';
      case 'divider':
        return (block.style || 'Divider') + ' divider';
      case 'card':
      case 'hero':
      case 'callout':
      case 'background':
      case 'accordion':
      case 'row':
        return block.title || BLOCK_DEFINITIONS[block.type].label;
      case 'icon':
        return block.icon || 'Icon';
      case 'columns':
        return String(block.columns || 2) + ' columns';
      case 'grid':
        return String(block.columns || 3) + ' column grid';
      default:
        return BLOCK_DEFINITIONS[block.type].label;
    }
  }

  function scrollBlockIntoView(blockId) {
    const blockElement = elements.canvas.querySelector('[data-block-id="' + blockId + '"]');
    if (blockElement) {
      blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function renderOverview() {
    if (!elements.overviewList) {
      return;
    }

    elements.overviewList.innerHTML = '';
    if (!state.blocks.length) {
      elements.overviewList.appendChild(createElement('p', 'pe-small', 'Add blocks to build the document outline.'));
      return;
    }

    const list = createElement('div', 'pe-overview-tree');
    getFlatBlockEntries().forEach((entry, index) => {
      const block = entry.block;
      const definition = BLOCK_DEFINITIONS[block.type];
      const item = createElement('button', 'pe-overview-item');
      item.type = 'button';
      item.classList.toggle('is-selected', block.id === state.selectedBlockId);
      if (entry.depth) {
        item.style.paddingLeft = String(16 + (entry.depth * 18)) + 'px';
      }
      item.appendChild(createIconElement(getBlockIconName(block.type), definition.fallbackIcon, 'pe-block-icon'));
      const body = createElement('span', 'pe-overview-item-body');
      body.appendChild(createElement('strong', '', definition.label));
      body.appendChild(createElement('small', '', getBlockOverviewLabel(block)));
      item.appendChild(body);
      item.appendChild(createElement('span', 'pe-overview-index', String(index + 1)));
      item.addEventListener('click', () => {
        selectBlock(block.id);
        scrollBlockIntoView(block.id);
      });
      list.appendChild(item);
    });
    elements.overviewList.appendChild(list);
  }

  function buildPageSummaryCard() {
    if (elements.pageStatusLabel) {
      elements.pageStatusLabel.textContent = state.page.status;
    }
    if (elements.blockCountLabel) {
      elements.blockCountLabel.textContent = String(getFlatBlockEntries().length);
    }
    if (elements.selectionSummaryLabel) {
      const selectedBlock = getSelectedBlock();
      elements.selectionSummaryLabel.textContent = selectedBlock ? BLOCK_DEFINITIONS[selectedBlock.type].label : 'None';
    }
  }

  function renderInspector() {
    const showingPagePanel = state.ui.inspectorTab === 'page';
    const showingOverviewPanel = state.ui.inspectorTab === 'overview';
    elements.pageSettingsPanel.hidden = !showingPagePanel; 
    elements.inspectorPanel.hidden = !(!showingPagePanel && !showingOverviewPanel);
    if (elements.overviewPanel) {
      elements.overviewPanel.hidden = !showingOverviewPanel;
    }

    elements.inspectorTabs.forEach((tab) => {
      const isActive = tab.dataset.tab === state.ui.inspectorTab;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    buildPageSummaryCard();

    if (showingPagePanel) {
      return;
    }

    if (showingOverviewPanel) {
      renderOverview();
      return;
    }

    const block = getSelectedBlock();
    if (!block) {
      elements.inspectorPanel.innerHTML = '<p class="pe-small">Select a block to see settings.</p>';
      return;
    }

    const definition = BLOCK_DEFINITIONS[block.type];
    const blockEntries = getFlatBlockEntries();
    const index = blockEntries.findIndex((entry) => entry.block.id === block.id);
    const card = `
      <section class="pe-settings-section">
        <h3>Overview</h3>
        <div class="pe-settings-card">
          <div class="pe-settings-row"><span>Type</span><strong>${escapeHtml(definition.label)}</strong></div>
          <div class="pe-settings-row"><span>Position</span><strong>${index + 1}</strong></div>
          <div class="pe-settings-row"><span>Alignment</span><strong>${escapeHtml(block.align || 'left')}</strong></div>
        </div>
      </section>
    `;

    const alignmentOptions = getAlignmentOptions(block)
      .map((option) => '<option value="' + option + '"' + (block.align === option ? ' selected' : '') + '>' + option.charAt(0).toUpperCase() + option.slice(1) + '</option>')
      .join('');

    let controls = `
      <section class="pe-settings-section">
        <h3>Block settings</h3>
        <div class="pe-inspector-field">
          <label for="pe-block-align">Alignment</label>
          <select id="pe-block-align">
            ${alignmentOptions}
          </select>
        </div>
      </section>
    `;

    if (block.type === 'paragraph') {
      controls += `
        <section class="pe-settings-section">
          <h3>Paragraph</h3>
          <div class="pe-inspector-field">
            <label for="pe-paragraph-html">Content</label>
            <textarea id="pe-paragraph-html" rows="6" placeholder="Paragraph HTML">${escapeHtml(block.html || '')}</textarea>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-paragraph-class-name">Custom class name</label>
            <input id="pe-paragraph-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="custom-paragraph-class" />
          </div>
        </section>
      `;
    }

    if (block.type === 'heading') {
      controls += `
        <section class="pe-settings-section">
          <h3>Heading</h3>
          <div class="pe-inspector-field">
            <label for="pe-heading-level">Level</label>
            <select id="pe-heading-level">
              <option value="1"${block.level === 1 ? ' selected' : ''}>H1</option>
              <option value="2"${block.level === 2 ? ' selected' : ''}>H2</option>
              <option value="3"${block.level === 3 ? ' selected' : ''}>H3</option>
              <option value="4"${block.level === 4 ? ' selected' : ''}>H4</option>
              <option value="5"${block.level === 5 ? ' selected' : ''}>H5</option>
              <option value="6"${block.level === 6 ? ' selected' : ''}>H6</option>
            </select>
          </div>
        </section>
      `;
    }

    if (block.type === 'image') {
      controls += `
        <section class="pe-settings-section">
          <h3>Image</h3>
          <div class="pe-inspector-field">
            <label for="pe-image-src">Source URL</label>
            <input id="pe-image-src" type="url" value="${escapeHtml(block.src || '')}" placeholder="/images/example.png" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-image-alt">Alt text</label>
            <input id="pe-image-alt" type="text" value="${escapeHtml(block.alt || '')}" placeholder="Describe the image" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-image-caption">Caption</label>
            <textarea id="pe-image-caption" rows="3" placeholder="Optional caption">${escapeHtml(block.caption || '')}</textarea>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-image-link-href">Link URL</label>
            <input id="pe-image-link-href" type="url" value="${escapeHtml(block.linkHref || '')}" placeholder="https://example.com/full-image" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-image-width">Width</label>
            <input id="pe-image-width" type="text" value="${escapeHtml(block.width || '')}" placeholder="800" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-image-height">Height</label>
            <input id="pe-image-height" type="text" value="${escapeHtml(block.height || '')}" placeholder="450" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-image-class-name">Custom class name</label>
            <input id="pe-image-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="hero-image" />
          </div>
        </section>
      `;
    }

    if (block.type === 'video') {
      controls += `
        <section class="pe-settings-section">
          <h3>Video</h3>
          <div class="pe-inspector-field">
            <label for="pe-video-src">Source URL</label>
            <input id="pe-video-src" type="url" value="${escapeHtml(block.src || '')}" placeholder="https://example.com/video.mp4" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-video-caption">Caption</label>
            <textarea id="pe-video-caption" rows="3" placeholder="Optional caption">${escapeHtml(block.caption || '')}</textarea>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-video-poster">Poster image</label>
            <input id="pe-video-poster" type="url" value="${escapeHtml(block.poster || '')}" placeholder="/images/video-poster.jpg" />
          </div>
          <label class="pe-checkbox-field" for="pe-video-autoplay">
            <input id="pe-video-autoplay" type="checkbox"${block.autoplay ? ' checked' : ''} />
            <span>Autoplay</span>
          </label>
          <label class="pe-checkbox-field" for="pe-video-loop">
            <input id="pe-video-loop" type="checkbox"${block.loop ? ' checked' : ''} />
            <span>Loop</span>
          </label>
          <label class="pe-checkbox-field" for="pe-video-muted">
            <input id="pe-video-muted" type="checkbox"${block.muted ? ' checked' : ''} />
            <span>Muted</span>
          </label>
          <label class="pe-checkbox-field" for="pe-video-controls">
            <input id="pe-video-controls" type="checkbox"${block.controls !== false ? ' checked' : ''} />
            <span>Show controls</span>
          </label>
          <div class="pe-inspector-field">
            <label for="pe-video-class-name">Custom class name</label>
            <input id="pe-video-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="feature-video" />
          </div>
        </section>
      `;
    }

    if (block.type === 'code') {
      controls += `
        <section class="pe-settings-section">
          <h3>Code</h3>
          <div class="pe-inspector-field">
            <label for="pe-code-language">Language</label>
            <input id="pe-code-language" type="text" value="${escapeHtml(block.language || '')}" placeholder="html, css, javascript" />
          </div>
        </section>
      `;
    }

    if (block.type === 'embed') {
      controls += `
        <section class="pe-settings-section">
          <h3>Embed</h3>
          <div class="pe-inspector-field">
            <label for="pe-embed-url">Source URL</label>
            <input id="pe-embed-url" type="url" value="${escapeHtml(block.url || '')}" placeholder="https://example.com/embed" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-embed-html">Trusted embed HTML</label>
            <textarea id="pe-embed-html" rows="6" placeholder="<iframe ...></iframe>">${escapeHtml(block.html || '')}</textarea>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-embed-provider">Provider</label>
            <input id="pe-embed-provider" type="text" value="${escapeHtml(block.provider || '')}" placeholder="youtube, vimeo, twitter" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-embed-caption">Caption</label>
            <textarea id="pe-embed-caption" rows="3" placeholder="Optional caption">${escapeHtml(block.caption || '')}</textarea>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-embed-aspect-ratio">Aspect ratio</label>
            <select id="pe-embed-aspect-ratio">
              <option value="16x9"${block.aspectRatio === '16x9' ? ' selected' : ''}>16x9</option>
              <option value="4x3"${block.aspectRatio === '4x3' ? ' selected' : ''}>4x3</option>
              <option value="1x1"${block.aspectRatio === '1x1' ? ' selected' : ''}>1x1</option>
            </select>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-embed-class-name">Custom class name</label>
            <input id="pe-embed-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="video-embed" />
          </div>
        </section>
      `;
    }

    if (block.type === 'separator') {
      controls += `
        <section class="pe-settings-section">
          <h3>Separator</h3>
          <div class="pe-inspector-field">
            <label for="pe-separator-style">Style</label>
            <select id="pe-separator-style">
              <option value="default"${block.style === 'default' ? ' selected' : ''}>Default</option>
              <option value="solid"${block.style === 'solid' ? ' selected' : ''}>Solid</option>
              <option value="dashed"${block.style === 'dashed' ? ' selected' : ''}>Dashed</option>
              <option value="dots"${block.style === 'dots' ? ' selected' : ''}>Dots</option>
              <option value="short"${block.style === 'short' ? ' selected' : ''}>Short</option>
            </select>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-separator-class-name">Custom class name</label>
            <input id="pe-separator-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="section-divider" />
          </div>
        </section>
      `;
    }

    if (block.type === 'group') {
      controls += `
        <section class="pe-settings-section">
          <h3>Group</h3>
          <div class="pe-inspector-field">
            <label for="pe-group-title">Heading</label>
            <input id="pe-group-title" type="text" value="${escapeHtml(block.title || '')}" placeholder="Section heading" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-group-text">Body copy</label>
            <textarea id="pe-group-text" rows="4" placeholder="Add grouped section copy">${escapeHtml(block.text || '')}</textarea>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-group-tag">Tag</label>
            <select id="pe-group-tag">
              <option value="div"${block.tag === 'div' ? ' selected' : ''}>div</option>
              <option value="section"${block.tag === 'section' ? ' selected' : ''}>section</option>
              <option value="article"${block.tag === 'article' ? ' selected' : ''}>article</option>
              <option value="aside"${block.tag === 'aside' ? ' selected' : ''}>aside</option>
            </select>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-group-layout">Layout</label>
            <select id="pe-group-layout">
              <option value="stack"${(block.layout || 'stack') === 'stack' ? ' selected' : ''}>Stack</option>
              <option value="row"${block.layout === 'row' ? ' selected' : ''}>Row</option>
            </select>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-group-background-color">Background color</label>
            <input id="pe-group-background-color" type="text" value="${escapeHtml(block.backgroundColor || '')}" placeholder="#f7f7f7" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-group-text-color">Text color</label>
            <input id="pe-group-text-color" type="text" value="${escapeHtml(block.textColor || '')}" placeholder="#201f1e" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-group-padding">Padding</label>
            <input id="pe-group-padding" type="text" value="${escapeHtml(block.padding || '')}" placeholder="2rem 1.5rem" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-group-margin">Margin</label>
            <input id="pe-group-margin" type="text" value="${escapeHtml(block.margin || '')}" placeholder="0 0 2rem" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-group-class-name">Custom class name</label>
            <input id="pe-group-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="feature-group" />
          </div>
        </section>
      `;
    }

    if (block.type === 'button') {
      controls += `
        <section class="pe-settings-section">
          <h3>Button</h3>
          <div class="pe-inspector-field">
            <label for="pe-button-text">Label</label>
            <input id="pe-button-text" type="text" value="${escapeHtml(block.text || '')}" placeholder="Call to action" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-button-url">URL</label>
            <input id="pe-button-url" type="url" value="${escapeHtml(block.url || '')}" placeholder="https://example.com" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-button-variant">Variant</label>
            <select id="pe-button-variant">
              <option value="primary"${(block.variant || 'primary') === 'primary' ? ' selected' : ''}>Primary</option>
              <option value="secondary"${block.variant === 'secondary' ? ' selected' : ''}>Secondary</option>
            </select>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-button-background-color">Background color</label>
            <input id="pe-button-background-color" type="text" value="${escapeHtml(block.backgroundColor || '')}" placeholder="#02760c" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-button-text-color">Text color</label>
            <input id="pe-button-text-color" type="text" value="${escapeHtml(block.textColor || '')}" placeholder="#ffffff" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-button-radius">Border radius</label>
            <input id="pe-button-radius" type="text" value="${escapeHtml(block.radius || '')}" placeholder="999px" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-button-class-name">Custom class name</label>
            <input id="pe-button-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="hero-cta" />
          </div>
        </section>
      `;
    }

    if (block.type === 'spacer') {
      controls += `
        <section class="pe-settings-section">
          <h3>Spacer</h3>
          <div class="pe-inspector-field">
            <label for="pe-spacer-height">Height</label>
            <input id="pe-spacer-height" type="text" value="${escapeHtml(block.height || '')}" placeholder="48px" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-spacer-preset">Preset</label>
            <select id="pe-spacer-preset">
              <option value="small"${block.preset === 'small' ? ' selected' : ''}>Small</option>
              <option value="medium"${(block.preset || 'medium') === 'medium' ? ' selected' : ''}>Medium</option>
              <option value="large"${block.preset === 'large' ? ' selected' : ''}>Large</option>
            </select>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-spacer-class-name">Custom class name</label>
            <input id="pe-spacer-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="section-gap" />
          </div>
        </section>
      `;
    }

    if (block.type === 'divider') {
      controls += `
        <section class="pe-settings-section">
          <h3>Divider</h3>
          <div class="pe-inspector-field">
            <label for="pe-divider-style">Style</label>
            <select id="pe-divider-style">
              <option value="solid"${(block.style || 'solid') === 'solid' ? ' selected' : ''}>Solid</option>
              <option value="dashed"${block.style === 'dashed' ? ' selected' : ''}>Dashed</option>
              <option value="gradient"${block.style === 'gradient' ? ' selected' : ''}>Gradient</option>
              <option value="ornament"${block.style === 'ornament' ? ' selected' : ''}>Ornament</option>
            </select>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-divider-thickness">Thickness</label>
            <input id="pe-divider-thickness" type="text" value="${escapeHtml(block.thickness || '')}" placeholder="2px" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-divider-width">Width</label>
            <select id="pe-divider-width">
              <option value="full"${(block.width || 'full') === 'full' ? ' selected' : ''}>Full</option>
              <option value="wide"${block.width === 'wide' ? ' selected' : ''}>Wide</option>
              <option value="short"${block.width === 'short' ? ' selected' : ''}>Short</option>
            </select>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-divider-class-name">Custom class name</label>
            <input id="pe-divider-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="feature-divider" />
          </div>
        </section>
      `;
    }

    if (block.type === 'card') {
      controls += `
        <section class="pe-settings-section">
          <h3>Card</h3>
          <div class="pe-inspector-field">
            <label for="pe-card-title">Title</label>
            <input id="pe-card-title" type="text" value="${escapeHtml(block.title || '')}" placeholder="Card title" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-card-text">Body copy</label>
            <textarea id="pe-card-text" rows="4" placeholder="Card body copy">${escapeHtml(block.text || '')}</textarea>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-card-background-color">Background color</label>
            <input id="pe-card-background-color" type="text" value="${escapeHtml(block.backgroundColor || '')}" placeholder="#ffffff" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-card-radius">Border radius</label>
            <input id="pe-card-radius" type="text" value="${escapeHtml(block.borderRadius || '')}" placeholder="24px" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-card-shadow">Shadow</label>
            <select id="pe-card-shadow">
              <option value="soft"${block.shadow === 'soft' ? ' selected' : ''}>Soft</option>
              <option value="medium"${(block.shadow || 'medium') === 'medium' ? ' selected' : ''}>Medium</option>
              <option value="outlined"${block.shadow === 'outlined' ? ' selected' : ''}>Outlined</option>
            </select>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-card-padding">Padding</label>
            <input id="pe-card-padding" type="text" value="${escapeHtml(block.padding || '')}" placeholder="1.5rem" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-card-class-name">Custom class name</label>
            <input id="pe-card-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="feature-card" />
          </div>
        </section>
      `;
    }

    if (block.type === 'hero') {
      controls += `
        <section class="pe-settings-section">
          <h3>Hero</h3>
          <div class="pe-inspector-field">
            <label for="pe-hero-eyebrow">Eyebrow</label>
            <input id="pe-hero-eyebrow" type="text" value="${escapeHtml(block.eyebrow || '')}" placeholder="Featured" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-hero-title">Title</label>
            <input id="pe-hero-title" type="text" value="${escapeHtml(block.title || '')}" placeholder="Hero title" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-hero-text">Body copy</label>
            <textarea id="pe-hero-text" rows="4" placeholder="Supporting hero copy">${escapeHtml(block.text || '')}</textarea>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-hero-background-image">Background image URL</label>
            <input id="pe-hero-background-image" type="url" value="${escapeHtml(block.backgroundImage || '')}" placeholder="/images/hero.jpg" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-hero-background-color">Background color</label>
            <input id="pe-hero-background-color" type="text" value="${escapeHtml(block.backgroundColor || '')}" placeholder="#0f172a" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-hero-overlay-color">Overlay color</label>
            <input id="pe-hero-overlay-color" type="text" value="${escapeHtml(block.overlayColor || '')}" placeholder="rgba(15,23,42,0.45)" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-hero-min-height">Minimum height</label>
            <input id="pe-hero-min-height" type="text" value="${escapeHtml(block.minHeight || '')}" placeholder="320px" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-hero-cta-text">CTA label</label>
            <input id="pe-hero-cta-text" type="text" value="${escapeHtml(block.ctaText || '')}" placeholder="Learn more" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-hero-cta-href">CTA URL</label>
            <input id="pe-hero-cta-href" type="url" value="${escapeHtml(block.ctaHref || '')}" placeholder="https://example.com" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-hero-class-name">Custom class name</label>
            <input id="pe-hero-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="landing-hero" />
          </div>
        </section>
      `;
    }

    if (block.type === 'icon') {
      controls += `
        <section class="pe-settings-section">
          <h3>Icon</h3>
          <div class="pe-inspector-field">
            <label for="pe-icon-name">Icon</label>
            <select id="pe-icon-name">
              <option value="star"${(block.icon || 'star') === 'star' ? ' selected' : ''}>Star</option>
              <option value="check"${block.icon === 'check' ? ' selected' : ''}>Check</option>
              <option value="info"${block.icon === 'info' ? ' selected' : ''}>Info</option>
              <option value="warning"${block.icon === 'warning' ? ' selected' : ''}>Warning</option>
              <option value="arrow"${block.icon === 'arrow' ? ' selected' : ''}>Arrow</option>
              <option value="spark"${block.icon === 'spark' ? ' selected' : ''}>Spark</option>
              <option value="heart"${block.icon === 'heart' ? ' selected' : ''}>Heart</option>
            </select>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-icon-size">Size</label>
            <input id="pe-icon-size" type="text" value="${escapeHtml(block.size || '')}" placeholder="48px" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-icon-color">Color</label>
            <input id="pe-icon-color" type="text" value="${escapeHtml(block.color || '')}" placeholder="#02760c" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-icon-label">Accessibility label</label>
            <input id="pe-icon-label" type="text" value="${escapeHtml(block.label || '')}" placeholder="Success" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-icon-class-name">Custom class name</label>
            <input id="pe-icon-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="feature-icon" />
          </div>
        </section>
      `;
    }

    if (block.type === 'callout') {
      controls += `
        <section class="pe-settings-section">
          <h3>Callout</h3>
          <div class="pe-inspector-field">
            <label for="pe-callout-variant">Variant</label>
            <select id="pe-callout-variant">
              <option value="info"${(block.variant || 'info') === 'info' ? ' selected' : ''}>Info</option>
              <option value="success"${block.variant === 'success' ? ' selected' : ''}>Success</option>
              <option value="warning"${block.variant === 'warning' ? ' selected' : ''}>Warning</option>
              <option value="error"${block.variant === 'error' ? ' selected' : ''}>Error</option>
            </select>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-callout-title">Title</label>
            <input id="pe-callout-title" type="text" value="${escapeHtml(block.title || '')}" placeholder="Notice title" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-callout-text">Body copy</label>
            <textarea id="pe-callout-text" rows="4" placeholder="Important supporting message">${escapeHtml(block.text || '')}</textarea>
          </div>
          <label class="pe-checkbox-field" for="pe-callout-show-icon">
            <input id="pe-callout-show-icon" type="checkbox"${block.showIcon !== false ? ' checked' : ''} />
            <span>Show icon</span>
          </label>
          <div class="pe-inspector-field">
            <label for="pe-callout-class-name">Custom class name</label>
            <input id="pe-callout-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="info-callout" />
          </div>
        </section>
      `;
    }

    if (block.type === 'background') {
      controls += `
        <section class="pe-settings-section">
          <h3>Background</h3>
          <div class="pe-inspector-field">
            <label for="pe-background-title">Title</label>
            <input id="pe-background-title" type="text" value="${escapeHtml(block.title || '')}" placeholder="Background section" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-background-text">Body copy</label>
            <textarea id="pe-background-text" rows="4" placeholder="Wrapped content summary">${escapeHtml(block.text || '')}</textarea>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-background-value">Background</label>
            <input id="pe-background-value" type="text" value="${escapeHtml(block.background || '')}" placeholder="linear-gradient(...)" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-background-overlay">Overlay</label>
            <input id="pe-background-overlay" type="text" value="${escapeHtml(block.overlay || '')}" placeholder="rgba(15,23,42,0.18)" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-background-padding">Padding</label>
            <input id="pe-background-padding" type="text" value="${escapeHtml(block.padding || '')}" placeholder="2rem" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-background-radius">Border radius</label>
            <input id="pe-background-radius" type="text" value="${escapeHtml(block.borderRadius || '')}" placeholder="24px" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-background-class-name">Custom class name</label>
            <input id="pe-background-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="surface-section" />
          </div>
        </section>
      `;
    }

    if (block.type === 'columns') {
      controls += `
        <section class="pe-settings-section">
          <h3>Columns</h3>
          <div class="pe-inspector-field">
            <label for="pe-columns-count">Column count</label>
            <select id="pe-columns-count">
              <option value="2"${Number(block.columns || 2) === 2 ? ' selected' : ''}>2</option>
              <option value="3"${Number(block.columns || 2) === 3 ? ' selected' : ''}>3</option>
              <option value="4"${Number(block.columns || 2) === 4 ? ' selected' : ''}>4</option>
            </select>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-columns-gap">Gap</label>
            <input id="pe-columns-gap" type="text" value="${escapeHtml(block.gap || '')}" placeholder="24px" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-columns-text">Content summary</label>
            <textarea id="pe-columns-text" rows="4" placeholder="Describe the intended column content">${escapeHtml(block.text || '')}</textarea>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-columns-class-name">Custom class name</label>
            <input id="pe-columns-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="feature-columns" />
          </div>
        </section>
      `;
    }

    if (block.type === 'grid') {
      controls += `
        <section class="pe-settings-section">
          <h3>Grid</h3>
          <div class="pe-inspector-field">
            <label for="pe-grid-columns">Column count</label>
            <select id="pe-grid-columns">
              <option value="2"${Number(block.columns || 3) === 2 ? ' selected' : ''}>2</option>
              <option value="3"${Number(block.columns || 3) === 3 ? ' selected' : ''}>3</option>
              <option value="4"${Number(block.columns || 3) === 4 ? ' selected' : ''}>4</option>
              <option value="5"${Number(block.columns || 3) === 5 ? ' selected' : ''}>5</option>
            </select>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-grid-min-width">Minimum item width</label>
            <input id="pe-grid-min-width" type="text" value="${escapeHtml(block.minWidth || '')}" placeholder="180px" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-grid-gap">Gap</label>
            <input id="pe-grid-gap" type="text" value="${escapeHtml(block.gap || '')}" placeholder="20px" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-grid-text">Content summary</label>
            <textarea id="pe-grid-text" rows="4" placeholder="Describe the intended grid content">${escapeHtml(block.text || '')}</textarea>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-grid-class-name">Custom class name</label>
            <input id="pe-grid-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="feature-grid" />
          </div>
        </section>
      `;
    }

    if (block.type === 'row') {
      controls += `
        <section class="pe-settings-section">
          <h3>Row</h3>
          <div class="pe-inspector-field">
            <label for="pe-row-title">Label</label>
            <input id="pe-row-title" type="text" value="${escapeHtml(block.title || '')}" placeholder="Row" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-row-text">Content summary</label>
            <textarea id="pe-row-text" rows="4" placeholder="Describe the horizontal layout">${escapeHtml(block.text || '')}</textarea>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-row-justify">Alignment</label>
            <select id="pe-row-justify">
              <option value="flex-start"${(block.justify || 'space-between') === 'flex-start' ? ' selected' : ''}>Start</option>
              <option value="center"${block.justify === 'center' ? ' selected' : ''}>Center</option>
              <option value="space-between"${(block.justify || 'space-between') === 'space-between' ? ' selected' : ''}>Space between</option>
              <option value="space-around"${block.justify === 'space-around' ? ' selected' : ''}>Space around</option>
            </select>
          </div>
          <div class="pe-inspector-field">
            <label for="pe-row-gap">Gap</label>
            <input id="pe-row-gap" type="text" value="${escapeHtml(block.gap || '')}" placeholder="16px" />
          </div>
          <label class="pe-checkbox-field" for="pe-row-wrap">
            <input id="pe-row-wrap" type="checkbox"${block.wrap !== false ? ' checked' : ''} />
            <span>Allow wrap</span>
          </label>
          <div class="pe-inspector-field">
            <label for="pe-row-class-name">Custom class name</label>
            <input id="pe-row-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="feature-row" />
          </div>
        </section>
      `;
    }

    if (block.type === 'accordion') {
      controls += `
        <section class="pe-settings-section">
          <h3>Accordion</h3>
          <div class="pe-inspector-field">
            <label for="pe-accordion-title">Title</label>
            <input id="pe-accordion-title" type="text" value="${escapeHtml(block.title || '')}" placeholder="Accordion item" />
          </div>
          <div class="pe-inspector-field">
            <label for="pe-accordion-text">Body copy</label>
            <textarea id="pe-accordion-text" rows="4" placeholder="Collapsible content summary">${escapeHtml(block.text || '')}</textarea>
          </div>
          <label class="pe-checkbox-field" for="pe-accordion-open">
            <input id="pe-accordion-open" type="checkbox"${block.open ? ' checked' : ''} />
            <span>Open by default</span>
          </label>
          <label class="pe-checkbox-field" for="pe-accordion-show-icon">
            <input id="pe-accordion-show-icon" type="checkbox"${block.showIcon !== false ? ' checked' : ''} />
            <span>Show icon</span>
          </label>
          <div class="pe-inspector-field">
            <label for="pe-accordion-class-name">Custom class name</label>
            <input id="pe-accordion-class-name" type="text" value="${escapeHtml(block.className || '')}" placeholder="faq-item" />
          </div>
        </section>
      `;
    }

    elements.inspectorPanel.innerHTML = card + controls;

    const alignSelect = document.getElementById('pe-block-align');
    if (alignSelect) {
      alignSelect.addEventListener('change', () => {
        block.align = alignSelect.value;
        markDirty();
        renderCanvas();
      });
    }

    const paragraphHtmlInput = document.getElementById('pe-paragraph-html');
    if (paragraphHtmlInput) {
      paragraphHtmlInput.addEventListener('input', () => {
        block.html = paragraphHtmlInput.value;
        markDirty();
        renderCanvas();
      });
    }

    const paragraphClassNameInput = document.getElementById('pe-paragraph-class-name');
    if (paragraphClassNameInput) {
      paragraphClassNameInput.addEventListener('input', () => {
        block.className = paragraphClassNameInput.value;
        markDirty();
        renderCanvas();
      });
    }

    const headingLevelSelect = document.getElementById('pe-heading-level');
    if (headingLevelSelect) {
      headingLevelSelect.addEventListener('change', () => {
        block.level = Number(headingLevelSelect.value);
        markDirty();
        renderCanvas();
      });
    }

    const imageSourceInput = document.getElementById('pe-image-src');
    if (imageSourceInput) {
      imageSourceInput.addEventListener('input', () => {
        block.src = imageSourceInput.value;
        markDirty();
      });
    }

    const imageAltInput = document.getElementById('pe-image-alt');
    if (imageAltInput) {
      imageAltInput.addEventListener('input', () => {
        block.alt = imageAltInput.value;
        markDirty();
      });
    }

    const imageCaptionInput = document.getElementById('pe-image-caption');
    if (imageCaptionInput) {
      imageCaptionInput.addEventListener('input', () => {
        block.caption = imageCaptionInput.value;
        markDirty();
      });
    }

    const imageLinkHrefInput = document.getElementById('pe-image-link-href');
    if (imageLinkHrefInput) {
      imageLinkHrefInput.addEventListener('input', () => {
        block.linkHref = imageLinkHrefInput.value;
        markDirty();
      });
    }

    const imageWidthInput = document.getElementById('pe-image-width');
    if (imageWidthInput) {
      imageWidthInput.addEventListener('input', () => {
        block.width = imageWidthInput.value;
        markDirty();
      });
    }

    const imageHeightInput = document.getElementById('pe-image-height');
    if (imageHeightInput) {
      imageHeightInput.addEventListener('input', () => {
        block.height = imageHeightInput.value;
        markDirty();
      });
    }

    const imageClassNameInput = document.getElementById('pe-image-class-name');
    if (imageClassNameInput) {
      imageClassNameInput.addEventListener('input', () => {
        block.className = imageClassNameInput.value;
        markDirty();
        renderCanvas();
      });
    }

    const videoSourceInput = document.getElementById('pe-video-src');
    if (videoSourceInput) {
      videoSourceInput.addEventListener('input', () => {
        block.src = videoSourceInput.value;
        markDirty();
      });
    }

    const videoCaptionInput = document.getElementById('pe-video-caption');
    if (videoCaptionInput) {
      videoCaptionInput.addEventListener('input', () => {
        block.caption = videoCaptionInput.value;
        markDirty();
      });
    }

    const videoPosterInput = document.getElementById('pe-video-poster');
    if (videoPosterInput) {
      videoPosterInput.addEventListener('input', () => {
        block.poster = videoPosterInput.value;
        markDirty();
      });
    }

    const videoAutoplayInput = document.getElementById('pe-video-autoplay');
    if (videoAutoplayInput) {
      videoAutoplayInput.addEventListener('change', () => {
        block.autoplay = videoAutoplayInput.checked;
        markDirty();
      });
    }

    const videoLoopInput = document.getElementById('pe-video-loop');
    if (videoLoopInput) {
      videoLoopInput.addEventListener('change', () => {
        block.loop = videoLoopInput.checked;
        markDirty();
      });
    }

    const videoMutedInput = document.getElementById('pe-video-muted');
    if (videoMutedInput) {
      videoMutedInput.addEventListener('change', () => {
        block.muted = videoMutedInput.checked;
        markDirty();
      });
    }

    const videoControlsInput = document.getElementById('pe-video-controls');
    if (videoControlsInput) {
      videoControlsInput.addEventListener('change', () => {
        block.controls = videoControlsInput.checked;
        markDirty();
        renderCanvas();
      });
    }

    const videoClassNameInput = document.getElementById('pe-video-class-name');
    if (videoClassNameInput) {
      videoClassNameInput.addEventListener('input', () => {
        block.className = videoClassNameInput.value;
        markDirty();
        renderCanvas();
      });
    }

    const codeLanguageInput = document.getElementById('pe-code-language');
    if (codeLanguageInput) {
      codeLanguageInput.addEventListener('input', () => {
        block.language = codeLanguageInput.value;
        markDirty();
      });
    }

    const embedUrlInput = document.getElementById('pe-embed-url');
    if (embedUrlInput) {
      embedUrlInput.addEventListener('input', () => {
        block.url = embedUrlInput.value;
        markDirty();
      });
    }

    const embedHtmlInput = document.getElementById('pe-embed-html');
    if (embedHtmlInput) {
      embedHtmlInput.addEventListener('input', () => {
        block.html = embedHtmlInput.value;
        markDirty();
      });
    }

    const embedProviderInput = document.getElementById('pe-embed-provider');
    if (embedProviderInput) {
      embedProviderInput.addEventListener('input', () => {
        block.provider = embedProviderInput.value;
        markDirty();
      });
    }

    const embedCaptionInput = document.getElementById('pe-embed-caption');
    if (embedCaptionInput) {
      embedCaptionInput.addEventListener('input', () => {
        block.caption = embedCaptionInput.value;
        markDirty();
      });
    }

    const embedAspectRatioInput = document.getElementById('pe-embed-aspect-ratio');
    if (embedAspectRatioInput) {
      embedAspectRatioInput.addEventListener('change', () => {
        block.aspectRatio = embedAspectRatioInput.value;
        markDirty();
      });
    }

    const embedClassNameInput = document.getElementById('pe-embed-class-name');
    if (embedClassNameInput) {
      embedClassNameInput.addEventListener('input', () => {
        block.className = embedClassNameInput.value;
        markDirty();
        renderCanvas();
      });
    }

    const separatorStyleInput = document.getElementById('pe-separator-style');
    if (separatorStyleInput) {
      separatorStyleInput.addEventListener('change', () => {
        block.style = separatorStyleInput.value;
        markDirty();
      });
    }

    const separatorClassNameInput = document.getElementById('pe-separator-class-name');
    if (separatorClassNameInput) {
      separatorClassNameInput.addEventListener('input', () => {
        block.className = separatorClassNameInput.value;
        markDirty();
        renderCanvas();
      });
    }

    const groupTitleInput = document.getElementById('pe-group-title');
    if (groupTitleInput) {
      groupTitleInput.addEventListener('input', () => {
        block.title = groupTitleInput.value;
        markDirty();
      });
    }

    const groupTextInput = document.getElementById('pe-group-text');
    if (groupTextInput) {
      groupTextInput.addEventListener('input', () => {
        block.text = groupTextInput.value;
        markDirty();
      });
    }

    const groupTagInput = document.getElementById('pe-group-tag');
    if (groupTagInput) {
      groupTagInput.addEventListener('change', () => {
        block.tag = groupTagInput.value;
        markDirty();
      });
    }

    const groupLayoutInput = document.getElementById('pe-group-layout');
    if (groupLayoutInput) {
      groupLayoutInput.addEventListener('change', () => {
        block.layout = groupLayoutInput.value;
        markDirty();
        renderCanvas();
      });
    }

    const groupBackgroundColorInput = document.getElementById('pe-group-background-color');
    if (groupBackgroundColorInput) {
      groupBackgroundColorInput.addEventListener('input', () => {
        block.backgroundColor = groupBackgroundColorInput.value;
        markDirty();
        renderCanvas();
      });
    }

    const groupTextColorInput = document.getElementById('pe-group-text-color');
    if (groupTextColorInput) {
      groupTextColorInput.addEventListener('input', () => {
        block.textColor = groupTextColorInput.value;
        markDirty();
        renderCanvas();
      });
    }

    const groupPaddingInput = document.getElementById('pe-group-padding');
    if (groupPaddingInput) {
      groupPaddingInput.addEventListener('input', () => {
        block.padding = groupPaddingInput.value;
        markDirty();
        renderCanvas();
      });
    }

    const groupMarginInput = document.getElementById('pe-group-margin');
    if (groupMarginInput) {
      groupMarginInput.addEventListener('input', () => {
        block.margin = groupMarginInput.value;
        markDirty();
        renderCanvas();
      });
    }

    const groupClassNameInput = document.getElementById('pe-group-class-name');
    if (groupClassNameInput) {
      groupClassNameInput.addEventListener('input', () => {
        block.className = groupClassNameInput.value;
        markDirty();
        renderCanvas();
      });
    }

    [
      ['pe-button-text', 'text'],
      ['pe-button-url', 'url'],
      ['pe-button-background-color', 'backgroundColor'],
      ['pe-button-text-color', 'textColor'],
      ['pe-button-radius', 'radius'],
      ['pe-button-class-name', 'className'],
      ['pe-spacer-height', 'height'],
      ['pe-spacer-class-name', 'className'],
      ['pe-divider-thickness', 'thickness'],
      ['pe-divider-class-name', 'className'],
      ['pe-card-title', 'title'],
      ['pe-card-text', 'text'],
      ['pe-card-background-color', 'backgroundColor'],
      ['pe-card-radius', 'borderRadius'],
      ['pe-card-padding', 'padding'],
      ['pe-card-class-name', 'className'],
      ['pe-hero-eyebrow', 'eyebrow'],
      ['pe-hero-title', 'title'],
      ['pe-hero-text', 'text'],
      ['pe-hero-background-image', 'backgroundImage'],
      ['pe-hero-background-color', 'backgroundColor'],
      ['pe-hero-overlay-color', 'overlayColor'],
      ['pe-hero-min-height', 'minHeight'],
      ['pe-hero-cta-text', 'ctaText'],
      ['pe-hero-cta-href', 'ctaHref'],
      ['pe-hero-class-name', 'className'],
      ['pe-icon-size', 'size'],
      ['pe-icon-color', 'color'],
      ['pe-icon-label', 'label'],
      ['pe-icon-class-name', 'className'],
      ['pe-callout-title', 'title'],
      ['pe-callout-text', 'text'],
      ['pe-callout-class-name', 'className'],
      ['pe-background-title', 'title'],
      ['pe-background-text', 'text'],
      ['pe-background-value', 'background'],
      ['pe-background-overlay', 'overlay'],
      ['pe-background-padding', 'padding'],
      ['pe-background-radius', 'borderRadius'],
      ['pe-background-class-name', 'className'],
      ['pe-columns-gap', 'gap'],
      ['pe-columns-text', 'text'],
      ['pe-columns-class-name', 'className'],
      ['pe-grid-min-width', 'minWidth'],
      ['pe-grid-gap', 'gap'],
      ['pe-grid-text', 'text'],
      ['pe-grid-class-name', 'className'],
      ['pe-row-title', 'title'],
      ['pe-row-text', 'text'],
      ['pe-row-gap', 'gap'],
      ['pe-row-class-name', 'className'],
      ['pe-accordion-title', 'title'],
      ['pe-accordion-text', 'text'],
      ['pe-accordion-class-name', 'className']
    ].forEach(([id, key]) => {
      const input = document.getElementById(id);
      if (!input) {
        return;
      }
      input.addEventListener('input', () => {
        block[key] = input.value;
        markDirty();
        renderCanvas();
      });
    });

    [
      ['pe-button-variant', 'variant'],
      ['pe-spacer-preset', 'preset'],
      ['pe-divider-style', 'style'],
      ['pe-divider-width', 'width'],
      ['pe-card-shadow', 'shadow'],
      ['pe-icon-name', 'icon'],
      ['pe-callout-variant', 'variant'],
      ['pe-columns-count', 'columns'],
      ['pe-grid-columns', 'columns'],
      ['pe-row-justify', 'justify']
    ].forEach(([id, key]) => {
      const input = document.getElementById(id);
      if (!input) {
        return;
      }
      input.addEventListener('change', () => {
        block[key] = ['columns'].includes(key) ? Number(input.value) : input.value;
        if (id === 'pe-grid-columns') {
          const nextCount = Math.max(1, Number(block.columns || 1));
          const gridItems = ensureGridItems(block);
          if (gridItems.length > nextCount) {
            const overflow = gridItems.slice(nextCount);
            gridItems.length = nextCount;
            const fallbackCell = gridItems[nextCount - 1] || [];
            overflow.forEach((group) => {
              if (Array.isArray(group) && group.length) {
                fallbackCell.push.apply(fallbackCell, group);
              }
            });
            gridItems[nextCount - 1] = fallbackCell;
          } else {
            ensureGridItems(block);
          }
        }
        markDirty();
        renderCanvas();
      });
    });

    [
      ['pe-callout-show-icon', 'showIcon'],
      ['pe-row-wrap', 'wrap'],
      ['pe-accordion-open', 'open'],
      ['pe-accordion-show-icon', 'showIcon']
    ].forEach(([id, key]) => {
      const input = document.getElementById(id);
      if (!input) {
        return;
      }
      input.addEventListener('change', () => {
        block[key] = input.checked;
        markDirty();
        renderCanvas();
      });
    });
  }

  function renderPreviewHint() {
    state.ui.previewLabel = state.ui.dirty ? 'Preview out of date' : state.ui.previewLabel;
    renderChrome();
  }

  function renderChrome() {
    const pageTitle = getResolvedPageTitle();
    const pagePath = getResolvedPublicPath();
    const selectedBlock = getSelectedBlock();

    if (elements.pageHeading) {
      elements.pageHeading.textContent = pageTitle;
    }
    if (elements.documentState) {
      elements.documentState.textContent = state.page.status;
    }
    if (elements.canvasTitle && elements.canvasTitle.value !== state.page.title) {
      elements.canvasTitle.value = state.page.title;
    }
    if (elements.pageTitle && elements.pageTitle.value !== state.page.title) {
      elements.pageTitle.value = state.page.title;
    }
    if (elements.pageTitleLabel) {
      elements.pageTitleLabel.textContent = isPostEditor() ? 'Post title' : 'Page title';
    }
    if (elements.pagePathLabel) {
      elements.pagePathLabel.textContent = isPostEditor() ? 'Post slug' : 'Published path';
    }
    if (elements.pagePath && elements.pagePath.value !== state.page.path) {
      elements.pagePath.value = state.page.path;
      elements.pagePath.placeholder = isPostEditor() ? 'my-post-slug' : 'untitled-page.html';
    }
    if (elements.postSettingsPanel) {
      elements.postSettingsPanel.hidden = !isPostEditor();
    }
    if (elements.postExcerpt && elements.postExcerpt.value !== state.page.excerpt) {
      elements.postExcerpt.value = state.page.excerpt;
    }
    if (elements.postCategories && elements.postCategories.value !== state.page.categories) {
      elements.postCategories.value = state.page.categories;
    }
    if (elements.postTags && elements.postTags.value !== state.page.tags) {
      elements.postTags.value = state.page.tags;
    }
    if (elements.postFeaturedImage && elements.postFeaturedImage.value !== state.page.featuredImage) {
      elements.postFeaturedImage.value = state.page.featuredImage;
    }
    if (elements.postDate) {
      const dateValue = String(state.page.date || '').slice(0, 10);
      if (elements.postDate.value !== dateValue) {
        elements.postDate.value = dateValue;
      }
    }
    if (elements.pathSummary) {
      elements.pathSummary.textContent = pagePath;
    }
    if (elements.selectedLabel) {
      elements.selectedLabel.textContent = selectedBlock ? 'Selected: ' + BLOCK_DEFINITIONS[selectedBlock.type].label : 'No block selected';
    }
    if (elements.dirtyLabel) {
      elements.dirtyLabel.textContent = state.ui.dirty ? 'Unsaved changes' : 'Saved';
    }
    if (elements.previewLabel) {
      elements.previewLabel.textContent = state.ui.previewLabel;
    }
    if (elements.status) {
      elements.status.textContent = state.ui.statusMessage;
    }
    if (elements.message) {
      elements.message.textContent = state.ui.flashMessage;
      elements.message.classList.toggle('is-error', state.ui.flashError);
    }

    buildPageSummaryCard();

    if (elements.saveButton) {
      elements.saveButton.disabled = state.ui.saving || state.ui.publishing;
    }
    if (elements.publishButton) {
      elements.publishButton.disabled = state.ui.saving || state.ui.publishing;
    }
    if (elements.previewButton) {
      elements.previewButton.disabled = state.ui.saving || state.ui.publishing;
    }
    if (elements.undoButton) {
      elements.undoButton.disabled = !state.ui.canUndo || state.ui.saving || state.ui.publishing;
    }
    if (elements.redoButton) {
      elements.redoButton.disabled = !state.ui.canRedo || state.ui.saving || state.ui.publishing;
    }

    elements.app.classList.toggle('pe-left-collapsed', !state.ui.leftExpanded);
    elements.app.classList.toggle('pe-right-collapsed', !state.ui.rightExpanded);

    if (elements.toggleLeftButton) {
      elements.toggleLeftButton.setAttribute('aria-pressed', state.ui.leftExpanded ? 'true' : 'false');
    }
    if (elements.toggleRightButton) {
      elements.toggleRightButton.setAttribute('aria-pressed', state.ui.rightExpanded ? 'true' : 'false');
    }
  }

  function insertBlockAtTarget(target, type, selectNewBlock) {
    if (target && target.kind === 'grid-cell') {
      const parentBlock = getBlockById(target.parentBlockId);
      if (!parentBlock || parentBlock.type !== 'grid') {
        return;
      }
    }

    pushUndoSnapshot(takeHistorySnapshot());
    const block = createBlock(type);

    if (target && target.kind === 'grid-cell') {
      const parentBlock = getBlockById(target.parentBlockId);
      const gridItems = ensureGridItems(parentBlock);

      if (!Array.isArray(gridItems[target.itemIndex])) {
        gridItems[target.itemIndex] = [];
      }
      gridItems[target.itemIndex].splice(target.index, 0, block);
    } else {
      state.blocks.splice(target.index, 0, block);
    }

    state.selectedBlockId = selectNewBlock ? block.id : state.selectedBlockId;
    state.ui.inspectorTab = selectNewBlock ? 'block' : state.ui.inspectorTab;
    markDirty();
    renderCanvas();
    focusBlock(block.id);
  }

  function insertBlockAt(index, type, selectNewBlock) {
    insertBlockAtTarget({ kind: 'root', index }, type, selectNewBlock);
  }

  function insertBlockAfter(blockId, type, selectNewBlock) {
    const location = findBlockLocation(blockId);
    if (!location) {
      return;
    }

    if (location.parentBlock && location.parentBlock.type === 'grid') {
      insertBlockAtTarget(
        {
          kind: 'grid-cell',
          parentBlockId: location.parentBlock.id,
          itemIndex: location.itemIndex,
          index: location.index + 1
        },
        type,
        selectNewBlock
      );
      return;
    }

    insertBlockAt(location.index + 1, type, selectNewBlock);
  }

  function focusBlock(blockId) {
    const blockElement = elements.canvas.querySelector('[data-block-id="' + blockId + '"]');
    if (!blockElement) {
      return;
    }

    const focusTarget = blockElement.querySelector('.pe-richtext, textarea, input');
    if (focusTarget) {
      focusTarget.focus();
      if (focusTarget.isContentEditable) {
        placeCaretToEnd(focusTarget);
      }
    }
  }

  function placeCaretToEnd(element) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function moveBlock(blockId, direction) {
    const location = findBlockLocation(blockId);
    if (!location) {
      return;
    }

    const nextIndex = location.index + direction;
    if (nextIndex < 0 || nextIndex >= location.blocks.length) {
      return;
    }

    pushUndoSnapshot(takeHistorySnapshot());
    const [block] = location.blocks.splice(location.index, 1);
    location.blocks.splice(nextIndex, 0, block);
    state.selectedBlockId = block.id;
    markDirty();
    renderCanvas();
    focusBlock(block.id);
  }

  function duplicateBlock(blockId) {
    const location = findBlockLocation(blockId);
    if (!location) {
      return;
    }

    pushUndoSnapshot(takeHistorySnapshot());
    const duplicate = cloneBlock(location.block);
    location.blocks.splice(location.index + 1, 0, duplicate);
    state.selectedBlockId = duplicate.id;
    markDirty();
    renderCanvas();
    focusBlock(duplicate.id);
  }

  function deleteBlock(blockId) {
    const location = findBlockLocation(blockId);
    if (!location) {
      return;
    }

    const entriesBeforeDelete = getFlatBlockEntries();
    const deletedEntryIndex = entriesBeforeDelete.findIndex((entry) => entry.block.id === blockId);
    pushUndoSnapshot(takeHistorySnapshot());
    location.blocks.splice(location.index, 1);
    if (!state.blocks.length) {
      const starter = createBlock('paragraph');
      state.blocks.push(starter);
    }

    const entriesAfterDelete = getFlatBlockEntries();
    const fallback =
      entriesAfterDelete[deletedEntryIndex] ||
      entriesAfterDelete[deletedEntryIndex - 1] ||
      (location.parentBlock ? { block: location.parentBlock } : null) ||
      null;
    state.selectedBlockId = fallback ? fallback.block.id : null;
    markDirty();
    renderCanvas();
  }

  function updatePageTitle(nextTitle) {
    state.page.title = nextTitle;
    syncPathIfNeeded();
    markDirty();
  }

  function updatePagePath(nextPath, fromUser) {
    state.page.path = isPostEditor() ? slugify(nextPath) : nextPath;
    state.page.pathEdited = !!fromUser;
    markDirty();
  }

  function serializeAlignClass(block) {
    const align = block.align || 'left';
    return align === 'left' ? '' : ' align-' + align;
  }

  function serializeCustomClassName(block) {
    return block.className ? ' ' + escapeHtml(block.className) : '';
  }

  function serializeAttribute(name, value) {
    if (value === undefined || value === null || value === '') {
      return '';
    }
    return ' ' + name + '="' + escapeHtml(value) + '"';
  }

  function serializeBooleanAttribute(name, value) {
    return value ? ' ' + name : '';
  }

  function serializeStyleAttribute(styleMap) {
    const entries = Object.entries(styleMap || {}).filter(([, value]) => value !== undefined && value !== null && value !== '');
    if (!entries.length) {
      return '';
    }

    const cssText = entries.map(([key, value]) => key + ': ' + escapeHtml(value)).join('; ');
    return ' style="' + cssText + '"';
  }

  function serializeBlockMetadata(block) {
    const payload = { ...block };
    delete payload.id;
    delete payload.type;
    delete payload.items;
    return serializeAttribute('data-block-type', block.type) + serializeAttribute('data-block-props', JSON.stringify(payload));
  }

  function readSerializedBlock(node) {
    const type = node && node.getAttribute ? node.getAttribute('data-block-type') : '';
    if (!type || !BLOCK_DEFINITIONS[type]) {
      return null;
    }

    const block = createBlock(type);
    const applyGridChildren = () => {
      if (block.type !== 'grid') {
        return;
      }
      const cellNodes = Array.from(node.children).filter((child) => child.classList && child.classList.contains('pe-grid-cell'));
      block.items = cellNodes.map((cellNode) => deserializeNodes(Array.from(cellNode.children)));
      ensureGridItems(block);
    };
    const rawProps = node.getAttribute('data-block-props');
    if (!rawProps) {
      applyGridChildren();
      return block;
    }

    try {
      const parsed = JSON.parse(rawProps);
      Object.assign(block, parsed || {});
      applyGridChildren();
      return block;
    } catch (_) {
      applyGridChildren();
      return block;
    }
  }

  function sanitizeEmbed(block) {
    const trustedHtml = String(block.html || '').trim();
    if (trustedHtml) {
      return trustedHtml;
    }

    const url = String(block.url || '').trim();
    if (!url) {
      return '<div class="pe-preview-note">Embed source missing.</div>';
    }

    return '<div class="pe-preview-embed"><a href="' + escapeHtml(url) + '">' + escapeHtml(url) + '</a></div>';
  }

  function serializeBlock(block) {
    const alignClass = serializeAlignClass(block);
    const customClassName = serializeCustomClassName(block);
    const blockMetadata = serializeBlockMetadata(block);
    switch (block.type) {
    case 'paragraph':
      return '<p' + blockMetadata + ' class="pe-preview-block' + alignClass + customClassName + '">' + (block.html || '') + '</p>';
      case 'heading': {
        const level = Math.min(6, Math.max(1, Number(block.level || 2)));
        return '<h' + level + blockMetadata + ' class="pe-preview-block' + alignClass + '">' + (block.text || '') + '</h' + level + '>';
      }
      case 'image': {
        const imageTag = '<img src="' + escapeHtml(block.src || '') + '" alt="' + escapeHtml(block.alt || '') + '"' + serializeAttribute('width', block.width) + serializeAttribute('height', block.height) + '>';
        const imageBody = block.linkHref ? '<a href="' + escapeHtml(block.linkHref) + '">' + imageTag + '</a>' : imageTag;
        const caption = block.caption ? '<figcaption>' + escapeHtml(block.caption) + '</figcaption>' : '';
        return '<figure' + blockMetadata + ' class="pe-preview-block pe-preview-image' + alignClass + customClassName + '">' + imageBody + caption + '</figure>';
      }
      case 'video': {
        const caption = block.caption ? '<figcaption>' + escapeHtml(block.caption) + '</figcaption>' : '';
        return '<figure' + blockMetadata + ' class="pe-preview-block pe-preview-video' + alignClass + customClassName + '"><video' + serializeBooleanAttribute('controls', block.controls !== false) + ' src="' + escapeHtml(block.src || '') + '"' + serializeAttribute('poster', block.poster) + serializeBooleanAttribute('autoplay', block.autoplay) + serializeBooleanAttribute('loop', block.loop) + serializeBooleanAttribute('muted', block.muted) + '></video>' + caption + '</figure>';
      }
      case 'code': {
        const language = block.language ? ' class="language-' + escapeHtml(block.language) + '"' : '';
        return '<pre' + blockMetadata + ' class="pe-preview-block pe-preview-code' + alignClass + '"><code' + language + '>' + escapeHtml(block.code || '') + '</code></pre>';
      }
      case 'embed':
        return '<figure' + blockMetadata + ' class="pe-preview-block pe-preview-embed pe-preview-embed--' + escapeHtml(block.aspectRatio || '16x9') + alignClass + customClassName + '">' + sanitizeEmbed(block) + (block.caption ? '<figcaption>' + escapeHtml(block.caption) + '</figcaption>' : '') + '</figure>';
      case 'separator':
        return '<hr' + blockMetadata + ' class="pe-preview-block pe-preview-separator pe-preview-separator--' + escapeHtml(block.style || 'default') + alignClass + customClassName + '">';
      case 'group':
        return '<' + escapeHtml(block.tag || 'section') + blockMetadata + ' class="pe-preview-block pe-preview-group pe-preview-group--' + escapeHtml(block.layout || 'stack') + alignClass + customClassName + '"' + serializeStyleAttribute({ 'background-color': block.backgroundColor, color: block.textColor, padding: block.padding, margin: block.margin }) + '><h2>' + escapeHtml(block.title || 'Section heading') + '</h2><p>' + escapeHtml(block.text || '') + '</p></' + escapeHtml(block.tag || 'section') + '>';
      case 'button': {
        const backgroundColor = block.backgroundColor || (block.variant === 'secondary' ? '#ffffff' : '#02760c');
        const textColor = block.textColor || (block.variant === 'secondary' ? '#201f1e' : '#ffffff');
        return '<p' + blockMetadata + ' class="pe-preview-block pe-preview-button-wrap' + alignClass + customClassName + '"><a class="pe-preview-button pe-preview-button--' + escapeHtml(block.variant || 'primary') + '" href="' + escapeHtml(block.url || '#') + '"' + serializeStyleAttribute({ 'background-color': backgroundColor, color: textColor, 'border-radius': block.radius || '999px' }) + '>' + escapeHtml(block.text || 'Call to action') + '</a></p>';
      }
      case 'spacer':
        return '<div' + blockMetadata + ' class="pe-preview-block pe-preview-spacer' + alignClass + customClassName + '"' + serializeStyleAttribute({ height: block.height || '48px' }) + '></div>';
      case 'divider': {
        const dividerStyles = {
          '--divider-thickness': block.thickness || '2px'
        };
        if (block.width === 'short') {
          dividerStyles.width = '33%';
        } else if (block.width === 'wide') {
          dividerStyles.width = '66%';
        } else {
          dividerStyles.width = '100%';
        }
        return '<div' + blockMetadata + ' class="pe-preview-block pe-preview-divider pe-preview-divider--' + escapeHtml(block.style || 'solid') + alignClass + customClassName + '"' + serializeStyleAttribute(dividerStyles) + '></div>';
      }
      case 'card': {
        const shadowValue = block.shadow === 'soft' ? '0 12px 30px rgba(15,23,42,0.08)' : block.shadow === 'outlined' ? '0 0 0 1px rgba(15,23,42,0.12)' : '0 18px 40px rgba(15,23,42,0.14)';
        return '<section' + blockMetadata + ' class="pe-preview-block pe-preview-card' + alignClass + customClassName + '"' + serializeStyleAttribute({ 'background-color': block.backgroundColor || '#ffffff', 'border-radius': block.borderRadius || '24px', padding: block.padding || '1.5rem', 'box-shadow': shadowValue }) + '><h3>' + escapeHtml(block.title || 'Card title') + '</h3><p>' + escapeHtml(block.text || '') + '</p></section>';
      }
      case 'hero': {
        const heroBackground = block.backgroundImage
          ? 'linear-gradient(' + escapeHtml(block.overlayColor || 'rgba(15,23,42,0.45)') + ', ' + escapeHtml(block.overlayColor || 'rgba(15,23,42,0.45)') + '), url(' + escapeHtml(block.backgroundImage) + ') center/cover'
          : (block.backgroundColor || '#0f172a');
        const cta = block.ctaText ? '<a class="pe-preview-button pe-preview-button--primary" href="' + escapeHtml(block.ctaHref || '#') + '">' + escapeHtml(block.ctaText) + '</a>' : '';
        return '<section' + blockMetadata + ' class="pe-preview-block pe-preview-hero' + alignClass + customClassName + '"' + serializeStyleAttribute({ background: heroBackground, color: '#ffffff', 'min-height': block.minHeight || '320px' }) + '>' + (block.eyebrow ? '<p class="pe-preview-hero-eyebrow">' + escapeHtml(block.eyebrow) + '</p>' : '') + '<h2>' + escapeHtml(block.title || 'Hero title') + '</h2><p>' + escapeHtml(block.text || '') + '</p>' + cta + '</section>';
      }
      case 'icon':
        return '<div' + blockMetadata + ' class="pe-preview-block pe-preview-icon-block' + alignClass + customClassName + '"><span role="img"' + serializeAttribute('aria-label', block.label || block.icon || 'Icon') + serializeStyleAttribute({ color: block.color || '#02760c', 'font-size': block.size || '48px' }) + '>' + escapeHtml(getNamedIconSymbol(block.icon)) + '</span></div>';
      case 'callout':
        return '<aside' + blockMetadata + ' class="pe-preview-block pe-preview-callout pe-preview-callout--' + escapeHtml(block.variant || 'info') + alignClass + customClassName + '">' + (block.showIcon ? '<span class="pe-preview-callout-icon">' + escapeHtml(getNamedIconSymbol(block.variant)) + '</span>' : '') + '<div><strong>' + escapeHtml(block.title || 'Notice title') + '</strong><p>' + escapeHtml(block.text || '') + '</p></div></aside>';
      case 'background':
        return '<section' + blockMetadata + ' class="pe-preview-block pe-preview-background' + alignClass + customClassName + '"' + serializeStyleAttribute({ background: block.overlay ? 'linear-gradient(' + escapeHtml(block.overlay) + ', ' + escapeHtml(block.overlay) + '), ' + escapeHtml(block.background || '#ffffff') : (block.background || '#ffffff'), padding: block.padding || '2rem', 'border-radius': block.borderRadius || '24px', position: 'relative' }) + '><h3>' + escapeHtml(block.title || 'Background section') + '</h3><p>' + escapeHtml(block.text || '') + '</p></section>';
      case 'columns': {
        const columnCount = Math.max(2, Math.min(4, Number(block.columns || 2)));
        const items = new Array(columnCount).fill('').map((_, index) => '<div class="pe-preview-shell">Column ' + (index + 1) + '</div>').join('');
        return '<section' + blockMetadata + ' class="pe-preview-block pe-preview-columns' + alignClass + customClassName + '"' + serializeStyleAttribute({ gap: block.gap || '24px' }) + '>' + items + '<p class="pe-preview-shell-copy">' + escapeHtml(block.text || '') + '</p></section>';
      }
      case 'grid': {
        const gridCount = Math.max(1, Math.min(6, Number(block.columns || 3)));
        const gridItems = ensureGridItems(block);
        const items = new Array(gridCount)
          .fill('')
          .map((_, index) => '<div class="pe-grid-cell">' + (gridItems[index] || []).map((childBlock) => serializeBlock(childBlock)).join('') + '</div>')
          .join('');
        const summary = block.text ? '<p class="pe-preview-shell-copy">' + escapeHtml(block.text) + '</p>' : '';
        return '<section' + blockMetadata + ' class="pe-preview-block pe-preview-grid' + alignClass + customClassName + '"' + serializeStyleAttribute({ gap: block.gap || '20px', '--grid-min': block.minWidth || '180px' }) + '>' + items + summary + '</section>';
      }
      case 'row': {
        const rowItems = '<div class="pe-preview-shell">Start</div><div class="pe-preview-shell">Middle</div><div class="pe-preview-shell">End</div>';
        return '<section' + blockMetadata + ' class="pe-preview-block pe-preview-row' + alignClass + customClassName + '"' + serializeStyleAttribute({ gap: block.gap || '16px', 'justify-content': block.justify || 'space-between', 'flex-wrap': block.wrap === false ? 'nowrap' : 'wrap' }) + '>' + rowItems + '<p class="pe-preview-shell-copy">' + escapeHtml(block.text || '') + '</p></section>';
      }
      case 'accordion':
        return '<details' + blockMetadata + ' class="pe-preview-block pe-preview-accordion' + alignClass + customClassName + '"' + serializeBooleanAttribute('open', block.open) + '><summary>' + escapeHtml(block.title || 'Accordion item') + (block.showIcon ? ' <span aria-hidden="true">⌄</span>' : '') + '</summary><p>' + escapeHtml(block.text || '') + '</p></details>';
      default:
        return '<!-- Unsupported block type: ' + escapeHtml(block.type) + ' -->';
    }
  }

  function composePageContent() {
    const parts = state.blocks.map((block) => serializeBlock(block));
    return [
      '<div class="page-wrap pe-generated-page">',
      parts.join('\n'),
      '</div>'
    ].join('\n');
  }

  function buildPageManifest() {
    const previousManifest = state.source.manifest && typeof state.source.manifest === 'object'
      ? state.source.manifest
      : {};
    const metadata = previousManifest.metadata && typeof previousManifest.metadata === 'object'
      ? { ...previousManifest.metadata }
      : {};
    const manifest = {
      ...previousManifest,
      output: getResolvedPagePath(),
      title: getResolvedPageTitle() + ' — 365 Evergreen',
      metadata: {
        ...metadata,
        pageTitle: getResolvedPageTitle(),
        description: typeof metadata.description === 'string' ? metadata.description : '',
        template: metadata.template || 'editor'
      },
      headerAttributes: {
        'data-tenant': '365evergreen.com',
        ...(previousManifest.headerAttributes || {})
      },
      contentFile: 'content/' + getResolvedSourceBaseName() + '.html'
    };

    if (Array.isArray(previousManifest.extraStylesheets) && previousManifest.extraStylesheets.length) {
      manifest.extraStylesheets = previousManifest.extraStylesheets.slice();
    } else {
      delete manifest.extraStylesheets;
    }

    if (Array.isArray(previousManifest.headScripts) && previousManifest.headScripts.length) {
      manifest.headScripts = previousManifest.headScripts.slice();
    } else {
      delete manifest.headScripts;
    }

    if (Array.isArray(previousManifest.bodyScripts) && previousManifest.bodyScripts.length) {
      manifest.bodyScripts = previousManifest.bodyScripts.slice();
    } else {
      delete manifest.bodyScripts;
    }

    if (state.source.scriptPath) {
      manifest.inlineScriptFiles = [toRelativeScriptPath(state.source.scriptPath)];
    } else {
      delete manifest.inlineScriptFiles;
    }

    return manifest;
  }

  function buildPostPayload() {
    return {
      title: getResolvedPageTitle(),
      slug: getResolvedSlug(),
      previousSlug: state.source.postSlug || '',
      excerpt: state.page.excerpt.trim(),
      categories: state.page.categories,
      tags: state.page.tags,
      featuredImage: state.page.featuredImage.trim(),
      date: state.page.date || new Date().toISOString(),
      html: composePageContent(),
      blocks: cloneHistoryValue(state.blocks)
    };
  }

  function composePostPreviewHtml() {
    const pageTitle = getResolvedPageTitle();
    const excerpt = escapeHtml(state.page.excerpt || '');
    const featuredImage = state.page.featuredImage.trim();
    const featuredImageMarkup = featuredImage
      ? '<figure class="pe-preview-featured-image"><img src="' + escapeHtml(featuredImage) + '" alt="' + escapeHtml(pageTitle) + '" /></figure>'
      : '';

    return [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '  <meta charset="UTF-8" />',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      '  <title>' + escapeHtml(pageTitle) + ' | 365 Evergreen</title>',
      '  <style>',
      '    body{font-family:"Segoe UI",sans-serif;margin:0;background:#f8fafc;color:#0f172a;}',
      '    main{max-width:960px;margin:0 auto;padding:3rem 1.5rem 4rem;}',
      '    header{margin-bottom:2rem;}',
      '    .pe-post-kicker{display:inline-flex;padding:.35rem .75rem;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:.8rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;}',
      '    h1{margin:.75rem 0 1rem;font-size:clamp(2rem,4vw,3.5rem);line-height:1.1;}',
      '    .pe-post-meta{color:#475569;font-size:.95rem;}',
      '    .pe-post-excerpt{margin:1rem 0 0;color:#334155;font-size:1.125rem;line-height:1.7;}',
      '    .pe-preview-featured-image{margin:2rem 0;border-radius:24px;overflow:hidden;}',
      '    .pe-preview-featured-image img{display:block;width:100%;height:auto;}',
      '  </style>',
      '</head>',
      '<body>',
      '  <main>',
      '    <header>',
      '      <span class="pe-post-kicker">Blog</span>',
      '      <h1>' + escapeHtml(pageTitle) + '</h1>',
      '      <div class="pe-post-meta">' + escapeHtml(String(state.page.date || '').slice(0, 10)) + '</div>',
      (excerpt ? '      <p class="pe-post-excerpt">' + excerpt + '</p>' : ''),
      '    </header>',
      featuredImageMarkup,
      composePageContent(),
      '  </main>',
      '</body>',
      '</html>'
    ].filter(Boolean).join('\n');
  }

  function composeHtml() {
    if (isPostEditor()) {
      return composePostPreviewHtml();
    }
    const manifest = buildPageManifest();
    const content = composePageContent();
    return [
      '<!doctype html>',
      '<html lang="en">',
      '<head>',
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      '<title>' + escapeHtml(manifest.title || getResolvedPageTitle()) + '</title>',
      '<link rel="stylesheet" href="/styles.css">',
      serializeExternalStylesheets(manifest.extraStylesheets),
      '<script src="' + escapeHtml(resolveAppAssetPath('/msal-browser.min.js')) + '"></script>',
      '<script src="' + escapeHtml(resolveAppAssetPath('/auth-config.js')) + '"></script>',
      '<script src="' + escapeHtml(resolveAppAssetPath('/auth.js')) + '"></script>',
      serializeExternalScripts(manifest.headScripts),
      '<style>',
      'body{font-family:Roboto,system-ui,-apple-system,"Segoe UI",sans-serif;margin:0;background:#f6f7f7;color:#201f1e;}',
      '.pe-generated-page{max-width:960px;padding:40px 24px 80px;}',
      '.pe-preview-block{margin:0 0 24px;}',
      '.align-center{text-align:center;}',
      '.align-right{text-align:right;}',
      '.align-justify{text-align:justify;}',
      '.align-wide{max-width:840px;}',
      '.align-full{max-width:none;width:100%;}',
      '.pe-preview-image img,.pe-preview-video video{display:block;max-width:100%;border-radius:12px;}',
      '.pe-preview-image figcaption,.pe-preview-video figcaption,.pe-preview-embed figcaption{margin-top:12px;color:#605e5c;font-size:14px;}',
      '.pe-preview-code{padding:20px;border-radius:12px;background:#111827;color:#f8fafc;overflow:auto;}',
      '.pe-preview-group{padding:24px;border:1px solid #e1dfdd;border-radius:16px;background:#ffffff;}',
      '.pe-preview-group--row{display:flex;gap:18px;align-items:flex-start;}',
      '.pe-preview-group--row h2,.pe-preview-group--row p{flex:1 1 0;}',
      '.pe-preview-separator{border:0;border-top:1px solid #d1d5db;margin:32px 0;}',
      '.pe-preview-separator--solid{border-top-style:solid;}',
      '.pe-preview-separator--dashed{border-top-style:dashed;}',
      '.pe-preview-separator--dots{border-top-style:dotted;}',
      '.pe-preview-separator--short{max-width:180px;}',
      '.pe-preview-embed iframe{width:100%;min-height:420px;border:0;border-radius:12px;}',
      '.pe-preview-embed--16x9 iframe{aspect-ratio:16/9;}',
      '.pe-preview-embed--4x3 iframe{aspect-ratio:4/3;}',
      '.pe-preview-embed--1x1 iframe{aspect-ratio:1/1;}',
      '.pe-preview-button-wrap{margin:0 0 24px;}',
      '.pe-preview-button{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;font-weight:600;text-decoration:none;border:1px solid transparent;}',
      '.pe-preview-button--secondary{border-color:#d0d5dd;}',
      '.pe-preview-spacer{border:1px dashed #cbd5e1;border-radius:12px;background:repeating-linear-gradient(180deg,#f8fafc,#f8fafc 8px,#ffffff 8px,#ffffff 16px);}',
      '.pe-preview-divider{border-top:var(--divider-thickness) solid #cbd5e1;margin:32px auto;}',
      '.pe-preview-divider--dashed{border-top-style:dashed;}',
      '.pe-preview-divider--gradient{border-top:0;height:var(--divider-thickness);background:linear-gradient(90deg,#38bdf8,#8b5cf6);}',
      '.pe-preview-divider--ornament{position:relative;}',
      '.pe-preview-divider--ornament::after{content:"";position:absolute;top:50%;left:50%;width:14px;height:14px;border-radius:999px;background:#ffffff;border:2px solid #94a3b8;transform:translate(-50%,-50%);}',
      '.pe-preview-card,.pe-preview-background,.pe-preview-callout,.pe-preview-hero,.pe-preview-columns,.pe-preview-grid,.pe-preview-row,.pe-preview-accordion{border-radius:24px;}',
      '.pe-preview-hero{display:grid;gap:12px;align-content:center;padding:32px;border-radius:28px;}',
      '.pe-preview-hero-eyebrow{margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.78;}',
      '.pe-preview-icon-block{display:flex;align-items:center;justify-content:flex-start;}',
      '.pe-preview-callout{display:flex;gap:14px;padding:20px;border:1px solid #d0d5dd;background:#eff6ff;}',
      '.pe-preview-callout--success{background:#ecfdf3;border-color:#b7ebc6;}',
      '.pe-preview-callout--warning{background:#fffbeb;border-color:#fcd34d;}',
      '.pe-preview-callout--error{background:#fef2f2;border-color:#fca5a5;}',
      '.pe-preview-callout-icon{font-weight:700;font-size:20px;line-height:1;}',
      '.pe-preview-columns,.pe-preview-row{display:flex;}',
      '.pe-preview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(var(--grid-min),1fr));}',
      '.pe-preview-shell{padding:16px;border:1px dashed #cbd5e1;border-radius:16px;background:#ffffff;color:#475467;font-size:13px;min-height:72px;}',
      '.pe-preview-shell-copy{margin:16px 0 0;color:#605e5c;}',
      '.pe-preview-accordion{padding:18px 20px;border:1px solid #d0d5dd;background:#ffffff;}',
      '.pe-preview-accordion summary{cursor:pointer;font-weight:600;}',
      '.pe-preview-note{padding:16px;border:1px dashed #cbd5e1;border-radius:12px;color:#605e5c;}',
      '</style>',
      '</head>',
      '<body>',
      '<div id="site-header"' + serializeHtmlAttributes(manifest.headerAttributes) + '></div>',
      '<script src="/site-header.js"></script>',
      content,
      '<div class="footer-note">365 Evergreen · hosted on Azure Storage static website</div>',
      serializeExternalScripts(manifest.bodyScripts),
      state.source.scriptPath && state.source.scriptContent
        ? '<script>\n' + state.source.scriptContent + '\n</script>'
        : '',
      '</body>',
      '</html>'
    ].join('');
  }

  async function refreshPreview() {
    elements.previewFrame.srcdoc = composeHtml();
    state.ui.previewLabel = 'Preview refreshed just now';
    state.ui.statusMessage = 'Preview updated';
    renderChrome();
  }

  async function persistPage(mode) {
    if (isPostEditor()) {
      return persistPost(mode);
    }
    const isPublishing = mode === 'publish';
    state.ui.saving = !isPublishing;
    state.ui.publishing = isPublishing;
    setStatus(isPublishing ? 'Publishing...' : 'Saving draft...');
    clearFlashMessage();

    try {
      if (state.source.loadFailed) {
        throw new Error('The existing generated page source could not be loaded, so save is blocked to avoid overwriting it.');
      }

      const manifest = buildPageManifest();
      const payload = {
        manifestPath: state.source.manifestPath || ('pages/' + getResolvedSourceBaseName() + '.json'),
        manifestContent: JSON.stringify(manifest, null, 2) + '\n',
        contentPath: state.source.contentPath || ('pages/content/' + getResolvedSourceBaseName() + '.html'),
        contentContent: composePageContent() + '\n'
      };

      if (state.source.scriptPath) {
        payload.scriptPath = state.source.scriptPath;
        payload.scriptContent = state.source.scriptContent || '';
      }

      const isEditing = !!state.source.manifestPath;
      if (isEditing && state.source.manifest && state.source.manifest.output && state.source.manifest.output !== manifest.output) {
        payload.previousPublishedPath = state.source.manifest.output;
      }

      const result = await apiRequest(isEditing ? EDIT_PAGE_PATH : CREATE_PAGE_PATH, {
        method: 'POST',
        includeJson: true,
        body: payload
      });

      state.source.manifestPath = payload.manifestPath;
      state.source.contentPath = payload.contentPath;
      state.source.manifest = manifest;
      state.page.path = result.publishedPath || manifest.output;
      state.page.pathEdited = true;
      state.page.status = isPublishing ? 'Published' : 'Draft';
      state.page.published = isPublishing;
      state.ui.dirty = false;
      state.ui.previewLabel = 'Preview matches saved content';
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('title', getResolvedPageTitle());
      nextUrl.searchParams.set('path', state.page.path);
      nextUrl.searchParams.set('slug', getResolvedSlug());
      nextUrl.searchParams.set('manifest', state.source.manifestPath);
      nextUrl.searchParams.set('content', state.source.contentPath);
      if (state.source.scriptPath) {
        nextUrl.searchParams.set('script', state.source.scriptPath);
      } else {
        nextUrl.searchParams.delete('script');
      }
      nextUrl.searchParams.delete('body');
      window.history.replaceState({}, '', nextUrl.toString());
      setFlashMessage((isPublishing ? 'Published ' : 'Saved ') + state.page.path + ' to $web.', false);
      setStatus(isPublishing ? 'Published' : 'Saved');
    } catch (error) {
      setStatus('Error');
      setFlashMessage((isPublishing ? 'Publish failed: ' : 'Save failed: ') + error.message, true);
    } finally {
      state.ui.saving = false;
      state.ui.publishing = false;
      renderChrome();
    }
  }

  async function persistPost(mode) {
    const isPublishing = mode === 'publish';
    state.ui.saving = !isPublishing;
    state.ui.publishing = isPublishing;
    setStatus(isPublishing ? 'Publishing...' : 'Saving draft...');
    clearFlashMessage();

    try {
      const payload = buildPostPayload();
      const result = await apiRequest(UPSERT_POST_PATH, {
        method: 'POST',
        includeJson: true,
        body: {
          ...payload,
          mode
        }
      });

      const post = result && result.post ? result.post : payload;
      state.page.title = post.title || payload.title;
      state.page.path = post.slug || payload.slug;
      state.page.pathEdited = true;
      state.page.excerpt = post.excerpt || payload.excerpt;
      state.page.categories = Array.isArray(post.categories) ? post.categories.join(', ') : state.page.categories;
      state.page.tags = Array.isArray(post.tags) ? post.tags.join(', ') : state.page.tags;
      state.page.featuredImage = post.featuredImage || payload.featuredImage;
      state.page.date = post.date || payload.date;
      state.page.status = isPublishing ? 'Published' : 'Draft';
      state.page.published = isPublishing;
      state.source.postSlug = state.page.path;
      state.ui.dirty = false;
      state.ui.previewLabel = 'Preview matches saved content';

      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('kind', 'post');
      nextUrl.searchParams.set('slug', state.page.path);
      nextUrl.searchParams.set('title', state.page.title);
      nextUrl.searchParams.delete('path');
      nextUrl.searchParams.delete('manifest');
      nextUrl.searchParams.delete('content');
      nextUrl.searchParams.delete('script');
      nextUrl.searchParams.delete('body');
      window.history.replaceState({}, '', nextUrl.toString());

      setFlashMessage((isPublishing ? 'Published ' : 'Saved draft for ') + '/blog/' + state.page.path + '.', false);
      setStatus(isPublishing ? 'Published' : 'Draft saved');
    } catch (error) {
      setStatus('Error');
      setFlashMessage((isPublishing ? 'Publish failed: ' : 'Save failed: ') + error.message, true);
    } finally {
      state.ui.saving = false;
      state.ui.publishing = false;
      renderChrome();
    }
  }

  function getDeserializeRoots(parsedDocument) {
    const generatedRoot = parsedDocument.body.querySelector('.pe-generated-page');
    if (generatedRoot) {
      return Array.from(generatedRoot.children);
    }

    return Array.from(parsedDocument.body.children);
  }

  async function loadSourceFile(filePath, asJson) {
    if (!filePath) {
      return null;
    }

    const response = await fetch(filePath, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Could not load ' + filePath + ' (' + response.status + ').');
    }

    return asJson ? response.json() : response.text();
  }

  async function hydrateFromRoute() {
    if (isPostEditor()) {
      return hydratePostFromRoute();
    }

    const title = params.get('title') || '';
    const path = params.get('path') || '';
    const inlineContent = params.get('body') || '';
    const manifest = params.get('manifest') || '';
    const contentHint = params.get('content') || '';
    const scriptPath = params.get('script') || '';

    state.page.title = title || '';
    state.page.path = path || '';
    state.page.pathEdited = !!path;
    syncPathIfNeeded();
    state.source.manifestPath = manifest;
    state.source.contentPath = contentHint;
    state.source.scriptPath = scriptPath;

    if (inlineContent.trim().startsWith('<')) {
      state.blocks = deserializeHtml(inlineContent);
    }

    if (manifest && contentHint) {
      try {
        const [manifestContent, contentContent, scriptContent] = await Promise.all([
          loadSourceFile(manifest, true),
          loadSourceFile(contentHint, false),
          scriptPath ? loadSourceFile(scriptPath, false) : Promise.resolve('')
        ]);

        state.source.manifest = manifestContent;
        state.source.scriptContent = scriptContent || '';

        const pageTitle = manifestContent && manifestContent.metadata && manifestContent.metadata.pageTitle;
        if (pageTitle) {
          state.page.title = pageTitle;
        }
        if (manifestContent && manifestContent.output) {
          state.page.path = manifestContent.output;
          state.page.pathEdited = true;
        }

        const loadedBlocks = deserializeHtml(contentContent);
        if (loadedBlocks.length) {
          state.blocks = loadedBlocks;
        }
      } catch (error) {
        state.source.loadFailed = true;
        setFlashMessage('Could not load the existing generated page source: ' + error.message, true);
      }
    }

    if (!state.blocks.length) {
      state.blocks.push(createBlock('paragraph'));
    }

    if (manifest || contentHint) {
      setFlashMessage('Editing ' + (path || getResolvedPagePath()) + ' from generated files: ' + [manifest, contentHint, params.get('script')].filter(Boolean).join(', '), false);
    }
  }

  async function hydratePostFromRoute() {
    const title = params.get('title') || '';
    const slug = params.get('slug') || '';
    const inlineContent = params.get('body') || '';

    state.page.title = title;
    state.page.path = slug;
    state.page.pathEdited = !!slug;
    state.source.postSlug = slug;
    state.page.excerpt = '';
    state.page.categories = '';
    state.page.tags = '';
    state.page.featuredImage = '';
    state.page.date = '';
    syncPathIfNeeded();

    if (inlineContent.trim().startsWith('<')) {
      state.blocks = deserializeHtml(inlineContent);
    }

    if (slug) {
      try {
        const result = await apiRequest(GET_POST_ADMIN_PATH + '?slug=' + encodeURIComponent(slug), {
          includeJson: true
        });
        const post = result && result.post ? result.post : null;
        if (post) {
          state.page.title = post.title || state.page.title;
          state.page.path = post.slug || slug;
          state.page.pathEdited = true;
          state.source.postSlug = state.page.path;
          state.page.status = post.status === 'published' ? 'Published' : 'Draft';
          state.page.published = post.status === 'published';
          state.page.excerpt = post.excerpt || '';
          state.page.categories = Array.isArray(post.categories) ? post.categories.join(', ') : '';
          state.page.tags = Array.isArray(post.tags) ? post.tags.join(', ') : '';
          state.page.featuredImage = post.featuredImage || '';
          state.page.date = post.date || '';
          if (Array.isArray(post.blocks) && post.blocks.length) {
            state.blocks = post.blocks.map((block) => assignBlockIds(block));
          } else if (post.html) {
            state.blocks = deserializeHtml(post.html);
          }
          setFlashMessage('Editing /blog/' + state.page.path + ' from the post publishing flow.', false);
        }
      } catch (error) {
        setFlashMessage('Could not load the existing post draft: ' + error.message, true);
      }
    }

    if (!state.blocks.length) {
      state.blocks.push(createBlock('paragraph'));
    }
  }

  function deserializeNodes(nodes) {
    const blocks = [];

    nodes.forEach((node) => {
      const serializedBlock = readSerializedBlock(node);
      if (serializedBlock) {
        blocks.push(serializedBlock);
        return;
      }

      const tagName = node.tagName.toLowerCase();
      if (tagName === 'p') {
        const block = createBlock('paragraph');
        block.html = node.innerHTML;
        blocks.push(block);
        return;
      }

      if (/^h[1-6]$/.test(tagName)) {
        const block = createBlock('heading');
        block.level = Number(tagName.slice(1));
        block.text = node.innerHTML;
        blocks.push(block);
        return;
      }

      if (tagName === 'figure' && node.querySelector('img')) {
        const block = createBlock('image');
        const image = node.querySelector('img');
        const caption = node.querySelector('figcaption');
        block.src = image ? image.getAttribute('src') || '' : '';
        block.alt = image ? image.getAttribute('alt') || '' : '';
        block.caption = caption ? caption.textContent || '' : '';
        blocks.push(block);
        return;
      }

      if (tagName === 'figure' && node.querySelector('video')) {
        const block = createBlock('video');
        const video = node.querySelector('video');
        const caption = node.querySelector('figcaption');
        block.src = video ? video.getAttribute('src') || '' : '';
        block.caption = caption ? caption.textContent || '' : '';
        blocks.push(block);
        return;
      }

      if (tagName === 'pre') {
        const block = createBlock('code');
        const code = node.querySelector('code');
        block.code = code ? code.textContent || '' : node.textContent || '';
        blocks.push(block);
        return;
      }

      if (tagName === 'hr') {
        blocks.push(createBlock('separator'));
        return;
      }

      if (tagName === 'section') {
        const block = createBlock('group');
        const heading = node.querySelector('h1,h2,h3,h4,h5,h6');
        const paragraph = node.querySelector('p');
        block.title = heading ? heading.textContent || '' : 'Section heading';
        block.text = paragraph ? paragraph.textContent || '' : stripTags(node.innerHTML);
        blocks.push(block);
        return;
      }

      const fallback = createBlock('embed');
      fallback.html = node.outerHTML;
      blocks.push(fallback);
    });

    return blocks;
  }

  function deserializeHtml(html) {
    const parsed = domParser.parseFromString(html, 'text/html');
    return deserializeNodes(getDeserializeRoots(parsed));
  }

  function createImageLibraryModal() {
    const modal = createElement('div', 'pe-image-library-modal');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = [
      '<div class="pe-image-library-backdrop" data-close-modal="true"></div>',
      '<div class="pe-image-library-dialog" role="dialog" aria-modal="true" aria-labelledby="pe-image-library-title">',
      '<div class="pe-image-library-header">',
      '<div><p class="pe-small">Image library</p><h2 id="pe-image-library-title">Choose an image from /images</h2></div>',
      '<button type="button" class="pe-image-library-close" data-close-modal="true" aria-label="Close image library">Close</button>',
      '</div>',
      '<p class="pe-image-library-status pe-small"></p>',
      '<div class="pe-image-library-grid"></div>',
      '<p class="pe-image-library-empty pe-small" hidden>No images are available yet.</p>',
      '</div>'
    ].join('');

    modal.addEventListener('click', (event) => {
      const target = event.target;
      if (target && target.dataset && target.dataset.closeModal === 'true') {
        closeImageLibrary();
      }
    });

    document.body.appendChild(modal);
    return modal;
  }

  const imageLibraryModal = createImageLibraryModal();

  function closeImageLibrary() {
    imageLibraryState.blockId = null;
    imageLibraryModal.classList.remove('is-open');
    imageLibraryModal.setAttribute('aria-hidden', 'true');
  }

  function renderImageLibrary(items) {
    const grid = imageLibraryModal.querySelector('.pe-image-library-grid');
    const status = imageLibraryModal.querySelector('.pe-image-library-status');
    const empty = imageLibraryModal.querySelector('.pe-image-library-empty');

    grid.innerHTML = '';
    const hasItems = Array.isArray(items) && items.length > 0;
    empty.hidden = hasItems;
    status.textContent = hasItems ? '' : 'No images found in /images yet.';

    items.forEach((item) => {
      const card = createElement('button', 'pe-image-library-card');
      card.type = 'button';
      card.innerHTML = '<img src="' + escapeHtml(item.urlPath) + '" alt="' + escapeHtml(item.name) + '"><span class="pe-image-library-name">' + escapeHtml(item.name) + '</span>';
      card.addEventListener('click', () => {
        const blockId = imageLibraryState.blockId;
        closeImageLibrary();
        if (blockId) {
          applyImageToBlock(blockId, item.urlPath, 'Selected image from the library.');
        }
      });
      grid.appendChild(card);
    });
  }

  async function openImageLibrary(blockId) {
    imageLibraryState.blockId = blockId;
    const status = imageLibraryModal.querySelector('.pe-image-library-status');
    const grid = imageLibraryModal.querySelector('.pe-image-library-grid');
    const empty = imageLibraryModal.querySelector('.pe-image-library-empty');
    status.textContent = 'Loading images...';
    grid.innerHTML = '';
    empty.hidden = true;
    imageLibraryModal.classList.add('is-open');
    imageLibraryModal.setAttribute('aria-hidden', 'false');

    try {
      const result = await apiRequest(IMAGE_LIBRARY_PATH);
      imageLibraryState.items = Array.isArray(result.items) ? result.items : [];
      renderImageLibrary(imageLibraryState.items);
    } catch (error) {
      status.textContent = error.message;
    }
  }

  function handleCanvasAction(event) {
    const button = event.target.closest('[data-action]');
    if (!button) {
      return;
    }

    const blockElement = button.closest('.pe-block');
    if (!blockElement) {
      return;
    }

    const blockId = blockElement.dataset.blockId;
    selectBlock(blockId);
    const action = button.dataset.action;

    if (action === 'move-up') {
      moveBlock(blockId, -1);
      return;
    }
    if (action === 'move-down') {
      moveBlock(blockId, 1);
      return;
    }
    if (action === 'duplicate') {
      duplicateBlock(blockId);
      return;
    }
    if (action === 'delete') {
      deleteBlock(blockId);
      return;
    }
    if (action === 'bold' || action === 'italic') {
      const richText = blockElement.querySelector('.pe-richtext');
      if (richText) {
        richText.focus();
        document.execCommand(action);
      }
    }
  }

  function isTextEditingTarget(target) {
    if (!target) {
      return false;
    }

    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
  }

  function isHistoryTarget(target) {
    if (!target || target.id === 'pe-inserter-search') {
      return false;
    }

    return Boolean(
      target.id === 'pe-canvas-title' ||
      target.closest('.pe-block') ||
      target.closest('#pe-inspector-content') ||
      target.closest('#pe-page-settings')
    );
  }

  function selectAdjacentBlock(direction) {
    const blockEntries = getFlatBlockEntries();
    const selectedIndex = blockEntries.findIndex((entry) => entry.block.id === state.selectedBlockId);
    if (selectedIndex < 0) {
      return;
    }

    const nextBlock = blockEntries[selectedIndex + direction];
    if (!nextBlock) {
      return;
    }

    selectBlock(nextBlock.block.id, { switchInspector: false });
    scrollBlockIntoView(nextBlock.block.id);
    const blockElement = elements.canvas.querySelector('[data-block-id="' + nextBlock.block.id + '"]');
    if (blockElement) {
      blockElement.focus();
    }
  }

  function bindEvents() {
    elements.inserterSearch.addEventListener('input', () => {
      state.ui.inserterQuery = elements.inserterSearch.value;
      renderInserter();
    });

    elements.addRootBlockButton.addEventListener('click', (event) => {
      openInsertMenu(state.blocks.length, event.currentTarget);
    });

    elements.canvas.addEventListener('click', handleCanvasAction);

    elements.toggleLeftButton.addEventListener('click', () => {
      state.ui.leftExpanded = !state.ui.leftExpanded;
      renderChrome();
    });

    elements.toggleRightButton.addEventListener('click', () => {
      state.ui.rightExpanded = !state.ui.rightExpanded;
      renderChrome();
    });

    elements.canvasTitle.addEventListener('input', () => {
      updatePageTitle(elements.canvasTitle.value);
    });

    elements.pageTitle.addEventListener('input', () => {
      updatePageTitle(elements.pageTitle.value);
    });

    elements.pagePath.addEventListener('input', () => {
      updatePagePath(elements.pagePath.value, true);
    });

    if (elements.postExcerpt) {
      elements.postExcerpt.addEventListener('input', () => {
        state.page.excerpt = elements.postExcerpt.value;
        markDirty();
      });
    }

    if (elements.postCategories) {
      elements.postCategories.addEventListener('input', () => {
        state.page.categories = elements.postCategories.value;
        markDirty();
      });
    }

    if (elements.postTags) {
      elements.postTags.addEventListener('input', () => {
        state.page.tags = elements.postTags.value;
        markDirty();
      });
    }

    if (elements.postFeaturedImage) {
      elements.postFeaturedImage.addEventListener('input', () => {
        state.page.featuredImage = elements.postFeaturedImage.value;
        markDirty();
      });
    }

    if (elements.postDate) {
      elements.postDate.addEventListener('input', () => {
        state.page.date = elements.postDate.value;
        markDirty();
      });
    }

    if (elements.undoButton) {
      elements.undoButton.addEventListener('click', undoLastChange);
    }

    if (elements.redoButton) {
      elements.redoButton.addEventListener('click', redoLastChange);
    }

    elements.previewButton.addEventListener('click', refreshPreview);
    elements.saveButton.addEventListener('click', () => persistPage('draft'));
    elements.publishButton.addEventListener('click', () => persistPage('publish'));

    elements.clearButton.addEventListener('click', () => {
      pushUndoSnapshot(takeHistorySnapshot());
      state.blocks = [];
      state.selectedBlockId = null;
      markDirty();
      setFlashMessage('Cleared the editor canvas.', false);
      renderCanvas();
    });

    elements.inspectorTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        state.ui.inspectorTab = tab.dataset.tab;
        renderInspector();
      });
    });

    document.addEventListener('focusin', (event) => {
      if (isHistoryTarget(event.target)) {
        beginHistoryCapture();
      }
    });

    document.addEventListener('focusout', (event) => {
      if (!isHistoryTarget(event.target)) {
        return;
      }

      setTimeout(() => {
        if (!isHistoryTarget(document.activeElement)) {
          commitHistoryCapture();
        }
      }, 0);
    });

    document.addEventListener('mousedown', (event) => {
      const target = event.target;
      if (
        target.closest('.pe-document-stage') &&
        !target.closest('.pe-block') &&
        !target.closest('.pe-insert-menu') &&
        !target.closest('.pe-insert-btn')
      ) {
        state.selectedBlockId = null;
        renderCanvas();
      }
    });

    document.addEventListener('keydown', (event) => {
      const isModifierPressed = event.metaKey || event.ctrlKey;
      if (isModifierPressed && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redoLastChange();
        } else {
          undoLastChange();
        }
        return;
      }

      if (event.key === 'Escape') {
        if (imageLibraryModal.classList.contains('is-open')) {
          closeImageLibrary();
          return;
        }
        closeInsertMenu();
        if (state.selectedBlockId) {
          state.selectedBlockId = null;
          renderCanvas();
        }
        return;
      }

      if (isTextEditingTarget(document.activeElement)) {
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        selectAdjacentBlock(-1);
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        selectAdjacentBlock(1);
      }
    });

    window.addEventListener('beforeunload', (event) => {
      if (!state.ui.dirty || state.ui.saving || state.ui.publishing) {
        return;
      }
      event.preventDefault();
      event.returnValue = '';
    });
  }

  loadIconRegistry().finally(async () => {
    await hydrateFromRoute();
    renderInserter();
    renderCanvas();
    renderChrome();
    bindEvents();
    refreshPreview();
  });

  window.__PageEditor = {
    getState: () => state,
    composeHtml,
    insertBlockAt,
    openImageLibrary
  };
})();
