// Shared editor utilities plus legacy render fallbacks for the Page Editor.
// Per-block modules register public definitions; this file keeps legacy fallbacks private.
(function () {
  function createTextStyle(overrides) {
    return Object.assign({
      fontSize: '',
      fontWeight: '',
      lineHeight: '',
      textColor: '',
      backgroundColor: ''
    }, overrides || {});
  }

  function createListStyle(overrides) {
    const next = Object.assign({
      typography: createTextStyle(),
      spacing: {
        itemGap: '',
        indentWidth: ''
      }
    }, overrides || {});
    next.typography = createTextStyle(next.typography || {});
    next.spacing = Object.assign({
      itemGap: '',
      indentWidth: ''
    }, next.spacing || {});
    return next;
  }

  function createGalleryImageId() {
    const random = Math.random().toString(36).slice(2, 10);
    return `img_${Date.now()}_${random}`;
  }

  function normalizeGalleryImage(image) {
    const next = Object.assign({
      id: '',
      src: '',
      alt: '',
      caption: ''
    }, image || {});
    next.id = typeof next.id === 'string' && next.id.trim() ? next.id.trim() : createGalleryImageId();
    next.src = typeof next.src === 'string' ? next.src : '';
    next.alt = typeof next.alt === 'string' ? next.alt : '';
    next.caption = typeof next.caption === 'string' ? next.caption : '';
    return next;
  }

  function normalizeGalleryImages(images) {
    return Array.isArray(images) ? images.map(normalizeGalleryImage) : [];
  }

  function clampGalleryColumns(value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return 3;
    return Math.max(1, Math.min(8, Math.round(numeric)));
  }

  function createGalleryStyle(overrides) {
    const next = Object.assign({
      spacing: {
        gap: '12px'
      },
      border: {
        radius: '',
        width: '',
        color: '#d1d5db'
      },
      layout: 'default'
    }, overrides || {});
    next.spacing = Object.assign({
      gap: '12px'
    }, next.spacing || {});
    next.border = Object.assign({
      radius: '',
      width: '',
      color: '#d1d5db'
    }, next.border || {});
    next.layout = typeof next.layout === 'string' && next.layout ? next.layout : 'default';
    return next;
  }

  function getGalleryTheme() {
    const source = window.EDITOR_GALLERY_THEME || {};
    return {
      breakpoints: Object.assign({
        tablet: 1024,
        mobile: 680
      }, source.breakpoints || {}),
      responsiveColumns: Object.assign({
        tablet: 2,
        mobile: 1
      }, source.responsiveColumns || {})
    };
  }

  function getResponsiveGalleryColumns(columns) {
    const clamped = clampGalleryColumns(columns);
    const theme = getGalleryTheme();
    const viewport = window.innerWidth || document.documentElement.clientWidth || 1440;
    if (viewport <= theme.breakpoints.mobile) return Math.min(clamped, theme.responsiveColumns.mobile || 1);
    if (viewport <= theme.breakpoints.tablet) return Math.min(clamped, theme.responsiveColumns.tablet || 2);
    return clamped;
  }

  function createGalleryImagesFromSources(sources) {
    return (Array.isArray(sources) ? sources : [])
      .map((src) => typeof src === 'string' ? src.trim() : '')
      .filter(Boolean)
      .map((src) => normalizeGalleryImage({ src }));
  }

  function pickGalleryUploadImages(options) {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = !!(options && options.multiple);
      input.style.display = 'none';
      document.body.appendChild(input);
      input.addEventListener('change', (event) => {
        const files = Array.from(event.target.files || []);
        const images = files.map((file) => normalizeGalleryImage({
          src: URL.createObjectURL(file),
          alt: file.name.replace(/\.[^.]+$/, '')
        }));
        input.remove();
        resolve(images);
      }, { once: true });
      input.click();
    });
  }

  function promptForGalleryLibraryImages(options) {
    const label = options && options.multiple
      ? 'Choose image path(s) from the media library, separated by commas'
      : 'Choose an image path from the media library';
    const response = window.prompt(label, options && options.multiple ? '/images/photo-1.jpg, /images/photo-2.jpg' : '/images/photo.jpg');
    if (!response) return [];
    return createGalleryImagesFromSources(response.split(','));
  }

  function promptForGalleryUrlImages(options) {
    const label = options && options.multiple
      ? 'Insert image URL(s), separated by commas'
      : 'Insert an image URL';
    const response = window.prompt(label, options && options.multiple ? 'https://example.com/photo-1.jpg, https://example.com/photo-2.jpg' : 'https://example.com/photo.jpg');
    if (!response) return [];
    return createGalleryImagesFromSources(response.split(','));
  }

  async function chooseGalleryImages(options) {
    const mode = window.prompt('Choose image source: upload, library, or url', 'upload');
    if (!mode) return [];
    const normalized = String(mode).trim().toLowerCase();
    if (normalized === 'upload') return pickGalleryUploadImages(options);
    if (normalized === 'library') return promptForGalleryLibraryImages(options);
    if (normalized === 'url') return promptForGalleryUrlImages(options);
    return [];
  }

  function createGalleryMediaElement(image, attrs, frameLabel) {
    const mediaLabel = frameLabel || image.alt || image.caption || 'Gallery image';
    const lightbox = !!(attrs && attrs.lightbox);
    const linkTo = attrs && attrs.linkTo ? attrs.linkTo : 'none';
    const sourceHref = image.src || '#';
    const attachmentHref = image.attachmentHref || sourceHref;
    if (lightbox) {
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'pe-gallery-media pe-gallery-media-button pe-gallery-lightbox-trigger';
      trigger.dataset.galleryLightbox = 'true';
      trigger.setAttribute('aria-label', `Open ${mediaLabel} in lightbox`);
      return trigger;
    }
    if (linkTo === 'media' || linkTo === 'attachment') {
      const anchor = document.createElement('a');
      anchor.className = 'pe-gallery-media pe-gallery-media-link';
      anchor.href = linkTo === 'attachment' ? attachmentHref : sourceHref;
      anchor.target = '_blank';
      anchor.rel = 'noreferrer noopener';
      anchor.setAttribute('aria-label', `Open ${mediaLabel}`);
      return anchor;
    }
    const wrapper = document.createElement('div');
    wrapper.className = 'pe-gallery-media';
    return wrapper;
  }

  function normalizeListItem(item) {
    if (typeof item === 'string') return { content: item, children: [] };
    const next = Object.assign({ content: '', children: [] }, item || {});
    next.content = typeof next.content === 'string' ? next.content : '';
    next.children = normalizeListItems(next.children, { allowEmpty: true });
    return next;
  }

  function normalizeListItems(items, options) {
    const allowEmpty = !!(options && options.allowEmpty);
    const source = Array.isArray(items) && items.length ? items : (allowEmpty ? [] : [{ content: '', children: [] }]);
    return source.map(normalizeListItem);
  }

  function getTextPresentationStyle(attrs) {
    if (!attrs || !attrs.style) return {};
    return attrs.style.typography ? attrs.style.typography : attrs.style;
  }

  function resolveListMarkerStyle(ordered, markerStyle) {
    if (ordered) {
      if (markerStyle === 'lower-alpha') return 'lower-alpha';
      if (markerStyle === 'upper-alpha') return 'upper-alpha';
      if (markerStyle === 'lower-roman') return 'lower-roman';
      if (markerStyle === 'upper-roman') return 'upper-roman';
      return 'decimal';
    }
    if (markerStyle === 'circle') return 'circle';
    if (markerStyle === 'square') return 'square';
    return 'disc';
  }

  function applyTextPresentation(element, attrs, fallbackTag) {
    const style = getTextPresentationStyle(attrs);
    const align = attrs && attrs.align ? attrs.align : '';
    if (align) element.style.textAlign = align;
    if (style.fontSize) element.style.fontSize = style.fontSize;
    if (style.fontWeight) element.style.fontWeight = style.fontWeight;
    if (style.lineHeight) element.style.lineHeight = style.lineHeight;
    if (style.textColor) element.style.color = style.textColor;
    if (style.backgroundColor) element.style.backgroundColor = style.backgroundColor;
    if (fallbackTag) element.dataset.blockTag = fallbackTag;
  }

  function createRichTextElement(tagName, className, attrs, options) {
    const element = document.createElement(tagName);
    element.className = className;
    element.setAttribute('contenteditable', 'true');
    element.setAttribute('role', 'textbox');
    element.setAttribute('aria-label', options.ariaLabel);
    if (options.multiline) element.setAttribute('aria-multiline', 'true');
    if (options.placeholder) element.dataset.placeholder = options.placeholder;
    if (options.spellcheck === false) element.spellcheck = false;
    if (options.useHtml) element.innerHTML = options.content || '';
    else element.textContent = options.content || '';
    applyTextPresentation(element, attrs, tagName);
    return element;
  }

  function renderListTree(items, ordered, attrs, level, parentPath) {
    const spacing = attrs && attrs.style && attrs.style.spacing ? attrs.style.spacing : {};
    const list = document.createElement(ordered ? 'ol' : 'ul');
    list.className = 'pe-block-list-tree';
    list.dataset.level = String(level);
    list.style.listStyleType = resolveListMarkerStyle(ordered, attrs && attrs.markerStyle ? attrs.markerStyle : '');
    if (spacing.itemGap) list.style.setProperty('--pe-list-item-gap', spacing.itemGap);
    if (spacing.indentWidth) list.style.setProperty('--pe-list-indent-width', spacing.indentWidth);
    list.setAttribute('aria-label', level === 0 ? (ordered ? 'Ordered list' : 'Unordered list') : `Nested ${ordered ? 'ordered' : 'unordered'} list level ${level + 1}`);
    applyTextPresentation(list, attrs, list.tagName.toLowerCase());

    items.forEach((item, index) => {
      const path = parentPath.concat(index);
      const pathString = path.join('.');
      const li = document.createElement('li');
      li.className = 'pe-block-list-item';
      li.dataset.itemPath = pathString;
      li.dataset.level = String(level);
      li.setAttribute('draggable', 'true');
      li.setAttribute('aria-level', String(level + 1));

      const content = createRichTextElement('div', 'pe-list-item-content pe-richtext', { style: getTextPresentationStyle(attrs) }, {
        ariaLabel: `List item ${pathString}`,
        multiline: true,
        placeholder: 'List item',
        useHtml: true,
        content: item.content || ''
      });
      content.dataset.itemPath = pathString;
      content.dataset.level = String(level);
      li.appendChild(content);

      if (item.children && item.children.length) {
        li.appendChild(renderListTree(item.children, ordered, attrs, level + 1, path));
      }
      list.appendChild(li);
    });

    return list;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/'/g, '&#39;');
  }

  function toInlineStyle(style) {
    const entries = Object.entries(style || {})
      .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
      .map(([key, value]) => `${key}:${String(value).trim()}`);
    return entries.length ? entries.join(';') : '';
  }

  window.EditorTextStyleUtils = {
    createTextStyle,
    toInlineStyle
  };

  window.EditorBlockHtmlUtils = {
    escapeHtml,
    escapeAttribute,
    toInlineStyle
  };

  window.EditorListUtils = {
    createListStyle,
    normalizeListItems,
    normalizeListItem,
    resolveListMarkerStyle
  };

  window.EditorGalleryUtils = {
    createGalleryStyle,
    normalizeGalleryImages,
    normalizeGalleryImage,
    clampGalleryColumns,
    getResponsiveGalleryColumns,
    createGalleryImagesFromSources,
    pickGalleryUploadImages,
    promptForGalleryLibraryImages,
    promptForGalleryUrlImages,
    chooseGalleryImages
  };

  window.EDITOR_LEGACY_BLOCK_DEFINITIONS = {
    paragraph: {
      label: 'Paragraph',
      fallbackIcon: 'P',
      category: 'Text',
      description: 'Body copy with inline formatting.',
      create: (attrs)=> ({ id: null, type: 'paragraph', attrs: Object.assign({ text: '', align: 'left', className: '', style: createTextStyle() }, attrs||{}) }),
      render: (block)=>{
          return createRichTextElement('div', 'pe-block-paragraph pe-richtext', block.attrs, {
            ariaLabel: 'Paragraph',
            multiline: true,
            placeholder: 'Write a paragraph...',
            useHtml: true,
            content: block.attrs && block.attrs.text ? block.attrs.text : ''
          });
      }
    },
    heading: {
      label: 'Heading',
      fallbackIcon: 'H',
      category: 'Text',
      description: 'Section title with level control.',
      create: (attrs)=> ({ id: null, type: 'heading', attrs: Object.assign({ text: 'Heading', level: 2, align: 'left', style: createTextStyle() }, attrs||{}) }),
      render: (block)=>{
          const level = block.attrs && block.attrs.level ? block.attrs.level : 2;
          return createRichTextElement('h'+level, `pe-block-heading pe-richtext pe-heading-level-${level}`, block.attrs, {
            ariaLabel: `Heading level ${level}`,
            useHtml: true,
            content: block.attrs && block.attrs.text ? block.attrs.text : ''
          });
      }
    },
    image: {
      label: 'Image',
      fallbackIcon: 'I',
      category: 'Media',
      description: 'Uploaded or library-backed image block.',
      create: (attrs)=> ({ id: null, type: 'image', attrs: Object.assign({ src: '', alt: '', caption: '', link: { href: '', target: '_blank' }, width: '', height: '', loading: 'lazy', focalPoint: { x: 50, y: 50 }, style: { border: '', radius: '' }, className: '', align: 'wide' }, attrs||{}) }),
      render: (block)=>{
        const aAttrs = block.attrs && block.attrs.link ? block.attrs.link : null;
        const wrap = document.createElement('div'); wrap.className='pe-block-image';
        const src = block.attrs && block.attrs.src ? block.attrs.src : '';

        // create toolbar host so per-image toolbar can attach
        const toolbarHost = document.createElement('div');
        toolbarHost.className = 'pe-block-toolbar-host components-popover__content pe-floating-toolbar';

        // If no src, show placeholder UI with Upload / Media Library / Insert from URL
        if (!src) {
          const placeholder = document.createElement('div');
          placeholder.className = 'pe-image-placeholder';
          placeholder.style.border = '1px solid #d1d5db';
          placeholder.style.padding = '18px';
          placeholder.style.borderRadius = '6px';
          placeholder.style.background = '#fff';

          const heading = document.createElement('div');
          heading.style.display = 'flex';
          heading.style.alignItems = 'center';
          heading.style.gap = '10px';
          const icon = document.createElement('span');
          icon.className = 'cb-icon';
          // try load registry icon for image (synchronous dev bootstrap)
          try {
            var _req = new XMLHttpRequest(); _req.open('GET', '../../design-system/icon-registry.json', false); _req.send(null);
            if (_req.status === 200 && _req.responseText) {
              try { var _reg = JSON.parse(_req.responseText); var _items = _reg && _reg.regular ? _reg.regular : []; for (var _i=0; _i<_items.length; _i++){ var _it = _items[_i]; if (_it && (_it.title === 'ic_fluent_image_24_regular' || _it.title.indexOf('image')!==-1) && _it.source){ icon.innerHTML = _it.source; break; } } } catch(e){}
            }
          } catch(e){}
          const title = document.createElement('strong');
          title.textContent = 'Image';
          heading.appendChild(icon);
          heading.appendChild(title);

          const desc = document.createElement('div');
          desc.style.marginTop = '12px';
          desc.textContent = 'Drag and drop an image, upload, or choose from your library.';

          const actions = document.createElement('div');
          actions.style.marginTop = '14px';
          actions.style.display = 'flex';
          actions.style.gap = '12px';

          const btnUpload = document.createElement('button');
          btnUpload.type = 'button';
          btnUpload.className = 'components-button components-primary';
          btnUpload.textContent = 'Upload';
          btnUpload.addEventListener('click', ()=>{
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            document.body.appendChild(input);
            input.addEventListener('change', (ev)=>{
              const f = ev.target.files && ev.target.files[0];
              if (!f) { input.remove(); return; }
              const url = URL.createObjectURL(f);
              if (window.EditorCore) EditorCore.setBlockAttrs(block.id, { src: url });
              input.remove();
            });
            input.click();
          });

          const btnLibrary = document.createElement('button');
          btnLibrary.type = 'button';
          btnLibrary.className = 'components-button';
          btnLibrary.textContent = 'Media Library';
          btnLibrary.addEventListener('click', ()=>{
            const path = window.prompt('Choose image path from library (e.g. /images/photo.jpg)');
            if (path && window.EditorCore) EditorCore.setBlockAttrs(block.id, { src: path });
          });

          const btnUrl = document.createElement('button');
          btnUrl.type = 'button';
          btnUrl.className = 'components-button';
          btnUrl.textContent = 'Insert from URL';
          btnUrl.addEventListener('click', ()=>{
            const url = window.prompt('Insert image URL');
            if (url && window.EditorCore) EditorCore.setBlockAttrs(block.id, { src: url });
          });

          actions.appendChild(btnUpload);
          actions.appendChild(btnLibrary);
          actions.appendChild(btnUrl);

          // drag and drop
          placeholder.addEventListener('dragover', (e)=>{ e.preventDefault(); placeholder.style.background = '#f9fafb'; });
          placeholder.addEventListener('dragleave', (e)=>{ e.preventDefault(); placeholder.style.background = '#fff'; });
          placeholder.addEventListener('drop', (e)=>{
            e.preventDefault(); placeholder.style.background = '#fff';
            const f = (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) || null;
            if (!f) return;
            const url = URL.createObjectURL(f);
            if (window.EditorCore) EditorCore.setBlockAttrs(block.id, { src: url });
          });

          placeholder.appendChild(heading);
          placeholder.appendChild(desc);
          placeholder.appendChild(actions);
          wrap.appendChild(placeholder);
          return wrap;
        }

        // otherwise render normal image
        const img = document.createElement('img');
        img.src = src;
        img.alt = block.attrs && block.attrs.alt ? block.attrs.alt : '';
        if (block.attrs && block.attrs.loading) img.loading = block.attrs.loading;
        if (block.attrs && block.attrs.width) img.setAttribute('width', block.attrs.width);
        if (block.attrs && block.attrs.height) img.setAttribute('height', block.attrs.height);
        try {
          const fp = block.attrs && block.attrs.focalPoint ? block.attrs.focalPoint : null;
          if (fp && (fp.x !== undefined || fp.y !== undefined)) {
            img.style.objectFit = 'cover';
            img.style.objectPosition = `${(fp.x||50)}% ${(fp.y||50)}%`;
          }
          const st = block.attrs && block.attrs.style ? block.attrs.style : null;
          if (st && st.radius) img.style.borderRadius = st.radius;
          if (st && st.border) img.style.border = st.border;
        } catch(e) {}
        if (aAttrs && aAttrs.href) {
          const a = document.createElement('a');
          a.href = aAttrs.href || '#';
          if (aAttrs.target) a.target = aAttrs.target;
          a.rel = 'noreferrer noopener';
          a.appendChild(img);
          wrap.appendChild(a);
        } else {
          wrap.appendChild(img);
        }
        if (block.attrs && block.attrs.caption) {
          const figcaption = document.createElement('div');
          figcaption.className = 'pe-image-caption';
          figcaption.textContent = block.attrs.caption;
          wrap.appendChild(figcaption);
        }
          // attach toolbar host at top for normal image
          wrap.insertBefore(toolbarHost, wrap.firstChild);
          try{
            const blockApi = { id: block.id, type: block.type, getAttrs: ()=> block.attrs||{}, setAttrs: (patch)=> { if (window.EditorCore) EditorCore.setBlockAttrs(block.id, patch); }, focus: ()=> { const el = document.querySelector(`[data-block-id='${block.id}']`); if (el){ const ed = el.querySelector('[contenteditable]'); if (ed) ed.focus(); } } };
            if (window.ToolbarFactory && typeof window.ToolbarFactory.createToolbar === 'function') window.ToolbarFactory.createToolbar(toolbarHost, 'image', blockApi);
          }catch(e){}
          return wrap; }
    },
    video: {
      label: 'Video',
      fallbackIcon: 'V',
      category: 'Media',
      description: 'Video source with optional caption.',
      create: () => ({ src: '', caption: '', poster: '', autoplay: false, loop: false, muted: false, controls: true, className: '', align: 'wide' })
    },
    gallery: {
      label: 'Gallery',
      fallbackIcon: '☷',
      category: 'Media',
      description: 'Responsive grid of images.',
      create: (attrs)=> {
        const nextAttrs = Object.assign({
          images: [],
          columns: 3,
          crop: true,
          linkTo: 'none',
          lightbox: false,
          style: createGalleryStyle(),
          className: ''
        }, attrs || {});
        nextAttrs.images = normalizeGalleryImages(nextAttrs.images);
        nextAttrs.columns = clampGalleryColumns(nextAttrs.columns);
        nextAttrs.crop = nextAttrs.crop !== false;
        nextAttrs.linkTo = ['none', 'media', 'attachment'].includes(nextAttrs.linkTo) ? nextAttrs.linkTo : 'none';
        nextAttrs.style = createGalleryStyle(nextAttrs.style);
        return { id: null, type: 'gallery', attrs: nextAttrs };
      },
      render: (block)=>{
        const wrap = document.createElement('div');
        const attrs = block && block.attrs ? block.attrs : {};
        const images = normalizeGalleryImages(attrs.images);
        const style = createGalleryStyle(attrs.style);
        const resolvedColumns = getResponsiveGalleryColumns(attrs.columns);
        wrap.className = 'pe-block-gallery';
        wrap.dataset.galleryLayout = style.layout || 'default';
        wrap.style.setProperty('--pe-gallery-columns', String(resolvedColumns));
        wrap.style.setProperty('--pe-gallery-gap', style.spacing.gap || '12px');
        wrap.style.setProperty('--pe-gallery-border-radius', style.border.radius || '0px');
        wrap.style.setProperty('--pe-gallery-border-width', style.border.width || '0px');
        wrap.style.setProperty('--pe-gallery-border-color', style.border.color || '#d1d5db');
        if (style.layout && style.layout !== 'default') wrap.classList.add(`align-${style.layout}`);
        if (attrs.crop !== false) wrap.classList.add('is-cropped');
        if (attrs.lightbox) wrap.classList.add('has-lightbox');

        if (!images.length) {
          const placeholder = document.createElement('div');
          placeholder.className = 'pe-gallery-placeholder';
          placeholder.setAttribute('aria-label', 'Empty gallery block');

          const heading = document.createElement('strong');
          heading.className = 'pe-gallery-placeholder__title';
          heading.textContent = 'Gallery';

          const desc = document.createElement('p');
          desc.className = 'pe-gallery-placeholder__description';
          desc.textContent = 'Upload, choose from the media library, or drag multiple images here to build a responsive gallery.';

          const actions = document.createElement('div');
          actions.className = 'pe-gallery-placeholder__actions';

          const uploadButton = document.createElement('button');
          uploadButton.type = 'button';
          uploadButton.className = 'pe-gallery-action';
          uploadButton.textContent = 'Upload';
          uploadButton.addEventListener('click', async () => {
            const nextImages = await pickGalleryUploadImages({ multiple: true });
            if (nextImages.length && window.EditorCore) EditorCore.setBlockAttrs(block.id, { images: nextImages });
          });

          const libraryButton = document.createElement('button');
          libraryButton.type = 'button';
          libraryButton.className = 'pe-gallery-action pe-gallery-action--secondary';
          libraryButton.textContent = 'Media Library';
          libraryButton.addEventListener('click', () => {
            const nextImages = promptForGalleryLibraryImages({ multiple: true });
            if (nextImages.length && window.EditorCore) EditorCore.setBlockAttrs(block.id, { images: nextImages });
          });

          const urlButton = document.createElement('button');
          urlButton.type = 'button';
          urlButton.className = 'pe-gallery-action pe-gallery-action--secondary';
          urlButton.textContent = 'Insert URL';
          urlButton.addEventListener('click', () => {
            const nextImages = promptForGalleryUrlImages({ multiple: true });
            if (nextImages.length && window.EditorCore) EditorCore.setBlockAttrs(block.id, { images: nextImages });
          });

          placeholder.addEventListener('dragover', (event) => {
            event.preventDefault();
            placeholder.classList.add('is-dragover');
          });
          placeholder.addEventListener('dragleave', () => {
            placeholder.classList.remove('is-dragover');
          });
          placeholder.addEventListener('drop', (event) => {
            event.preventDefault();
            placeholder.classList.remove('is-dragover');
            const files = Array.from(event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files : []);
            const nextImages = files.map((file) => normalizeGalleryImage({
              src: URL.createObjectURL(file),
              alt: file.name.replace(/\.[^.]+$/, '')
            }));
            if (nextImages.length && window.EditorCore) EditorCore.setBlockAttrs(block.id, { images: nextImages });
          });

          actions.append(uploadButton, libraryButton, urlButton);
          placeholder.append(heading, desc, actions);
          wrap.appendChild(placeholder);
          return wrap;
        }

        const grid = document.createElement('div');
        grid.className = 'pe-gallery-grid';
        grid.setAttribute('role', 'list');

        images.forEach((image, index) => {
          const figure = document.createElement('figure');
          figure.className = 'pe-gallery-item';
          figure.dataset.imageId = image.id;
          figure.dataset.imageIndex = String(index);
          figure.setAttribute('draggable', 'true');
          figure.setAttribute('role', 'listitem');

          const frame = document.createElement('div');
          frame.className = 'pe-gallery-frame';

          const media = createGalleryMediaElement(image, attrs, `Gallery image ${index + 1}`);
          media.dataset.imageId = image.id;
          media.dataset.imageIndex = String(index);

          const img = document.createElement('img');
          img.src = image.src || '';
          img.alt = image.alt || '';
          img.loading = 'lazy';
          img.className = 'pe-gallery-image';
          media.appendChild(img);

          const removeButton = document.createElement('button');
          removeButton.type = 'button';
          removeButton.className = 'pe-gallery-remove';
          removeButton.dataset.imageId = image.id;
          removeButton.setAttribute('aria-label', `Remove gallery image ${index + 1}`);
          removeButton.textContent = 'Remove';

          frame.append(media, removeButton);
          figure.appendChild(frame);

          const caption = document.createElement('figcaption');
          caption.className = 'pe-gallery-caption pe-richtext';
          caption.dataset.imageId = image.id;
          caption.dataset.caption = 'true';
          caption.dataset.placeholder = 'Add caption';
          caption.setAttribute('contenteditable', 'true');
          caption.setAttribute('role', 'textbox');
          caption.setAttribute('aria-label', `Gallery caption ${index + 1}`);
          caption.textContent = image.caption || '';
          figure.appendChild(caption);

          grid.appendChild(figure);
        });

        wrap.appendChild(grid);
        return wrap;
      }
    },
    audio: {
      label: 'Audio',
      fallbackIcon: '♫',
      category: 'Media',
      description: 'Audio player for uploaded or linked audio files.',
      create: (attrs)=> ({ id:null, type:'audio', attrs: Object.assign({ src: '', title: '', artist: '', autoplay: false, loop: false, preload: 'metadata', className: '' }, attrs||{}) }),
      render: (block)=>{ const el = document.createElement('div'); el.className='pe-block-audio'; const a = document.createElement('audio'); a.controls = true; a.src = block.attrs && block.attrs.src? block.attrs.src : ''; el.appendChild(a); return el; }
    },
    file: {
      label: 'File',
      fallbackIcon: '📎',
      category: 'Media',
      description: 'Downloadable file link block (PDF, doc, etc).',
      create: (attrs)=> ({ id:null, type:'file', attrs: Object.assign({ src: '', filename: '', filesize: '', description: '', className: '' }, attrs||{}) }),
      render: (block)=>{ const wrap = document.createElement('div'); wrap.className='pe-block-file'; const a = document.createElement('a'); a.href = block.attrs && block.attrs.src? block.attrs.src : '#'; a.textContent = block.attrs && block.attrs.filename? block.attrs.filename : 'Download file'; a.setAttribute('download',''); wrap.appendChild(a); return wrap; }
    },
    'media-text': {
      label: 'Media & Text',
      fallbackIcon: '⤡',
      category: 'Media',
      description: 'Two-column media with text area.',
      create: (attrs)=> ({ id:null, type:'media-text', attrs: Object.assign({ media: { type: 'image', src: '', alt: '' }, text: [{ type:'paragraph', attrs:{ text:'' }}], layout: 'media-left', gap: '16px', className: '' }, attrs||{}) }),
      render: (block)=>{ const wrap = document.createElement('div'); wrap.className='pe-block-media-text'; const media = document.createElement('div'); media.className='mt-media'; const txt = document.createElement('div'); txt.className='mt-text'; if(block.attrs && block.attrs.media && block.attrs.media.src){ const im = document.createElement('img'); im.src = block.attrs.media.src; im.alt = block.attrs.media.alt || ''; media.appendChild(im); } const p = document.createElement('div'); p.textContent = (block.attrs && block.attrs.text && block.attrs.text[0] && block.attrs.text[0].attrs && block.attrs.text[0].attrs.text) || ''; txt.appendChild(p); wrap.appendChild(media); wrap.appendChild(txt); return wrap; }
    },
    code: {
      label: 'Code',
      fallbackIcon: '{}',
      category: 'Text',
      description: 'Preformatted code block.',
      create: (attrs)=> ({ id: null, type: 'code', attrs: Object.assign({ code: '', language: '', align: 'left', style: createTextStyle({ backgroundColor: '#0f172a', textColor: '#f8fafc' }) }, attrs||{}) }),
      render: (block)=>{
        const pre = createRichTextElement('pre', 'pe-block-code', block.attrs, {
          ariaLabel: 'Code block',
          multiline: true,
          useHtml: false,
          spellcheck: false,
          content: block.attrs && block.attrs.code ? block.attrs.code : ''
        });
        const code = document.createElement('code');
        code.textContent = block.attrs && block.attrs.code ? block.attrs.code : '';
        pre.textContent = '';
        pre.appendChild(code);
        if (block.attrs && block.attrs.language) pre.dataset.language = block.attrs.language;
        return pre;
      }
    },
    list: {
      label: 'List',
      fallbackIcon: '•',
      category: 'Text',
      description: 'Ordered or unordered list.',
      create: (attrs)=> {
        const nextAttrs = Object.assign({ ordered: false, items: [{ content: '', children: [] }], className: '', align: 'left', markerStyle: 'disc', style: createListStyle() }, attrs||{});
        nextAttrs.items = normalizeListItems(nextAttrs.items);
        nextAttrs.style = createListStyle(nextAttrs.style);
        nextAttrs.markerStyle = nextAttrs.markerStyle || (nextAttrs.ordered ? 'decimal' : 'disc');
        return { id: null, type: 'list', attrs: nextAttrs };
      },
      render: (block)=>{
        const wrap = document.createElement('div'); wrap.className='pe-block-list';
        const attrs = block && block.attrs ? block.attrs : {};
        const normalized = normalizeListItems(attrs.items);
        const listStyle = createListStyle(attrs.style);
        wrap.style.setProperty('--pe-list-item-gap', listStyle.spacing.itemGap || '');
        wrap.style.setProperty('--pe-list-indent-width', listStyle.spacing.indentWidth || '');
        wrap.appendChild(renderListTree(normalized, !!attrs.ordered, Object.assign({}, attrs, { style: listStyle }), 0, []));
        return wrap;
      }
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
      create: (attrs)=> ({ id: null, type: 'separator', attrs: Object.assign({ style: 'default', className: '', align: 'full' }, attrs||{}) })
    },
    group: {
      label: 'Group',
      fallbackIcon: '[]',
      category: 'Design',
      description: 'Section wrapper for grouped content.',
      create: (attrs)=> ({ id: null, type: 'group', attrs: Object.assign({ title: 'Section heading', text: '', tag: 'section', layout: 'stack', backgroundColor: '', textColor: '', padding: '2rem 1.5rem', margin: '', className: '', align: 'wide', children: [] }, attrs||{}) })
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
      create: () => ({ id: null, type: 'spacer', attrs: Object.assign({ height: '48px', preset: 'medium', className: '', align: 'full' }, {}) })
    },
    stack: {
      label: 'Stack',
      fallbackIcon: '∥',
      category: 'Design',
      description: 'Vertical stack layout container.',
      create: (attrs)=> ({ id:null, type:'stack', attrs: Object.assign({ gap: '16px', align: 'wide', className: '' }, attrs||{}) })
    },
    column: {
      label: 'Column',
      fallbackIcon: '▦',
      category: 'Design',
      description: 'Single column container used inside Columns.',
      create: (attrs)=> ({ id:null, type:'column', attrs: Object.assign({ width: '1fr', className: '', children: [] }, attrs||{}) })
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
      create: (attrs)=> ({ id: null, type: 'card', attrs: Object.assign({ title: 'Card title', text: 'Card body copy', backgroundColor: '#ffffff', borderRadius: '24px', shadow: 'medium', padding: '1.5rem', className: '', align: 'wide' }, attrs||{}) })
    },
    hero: {
      label: 'Hero',
      fallbackIcon: '★',
      category: 'Design',
      description: 'Large banner section with background and optional CTA.',
      create: (attrs)=> ({ id: null, type: 'hero', attrs: Object.assign({ eyebrow: '', title: 'Hero title', text: 'Supporting hero copy', backgroundImage: '', backgroundColor: '#0f172a', overlayColor: 'rgba(15,23,42,0.45)', minHeight: '320px', ctaText: '', ctaHref: '', className: '', align: 'full' }, attrs||{}) })
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
      create: (attrs)=> {
        var cfg = Object.assign({ columns: 2, gap: '24px', text: 'Add column content summary', className: '', align: 'wide' }, attrs||{});
        var cols = parseInt(cfg.columns,10) || 2;
        var children = [];
        for (var i=0;i<cols;i++){
          if (window && window.EDITOR_BLOCK_DEFINITIONS && window.EDITOR_BLOCK_DEFINITIONS.column && typeof window.EDITOR_BLOCK_DEFINITIONS.column.create === 'function'){
            var col = window.EDITOR_BLOCK_DEFINITIONS.column.create({ width: '1fr' });
            children.push(col);
          } else {
            children.push({ id: null, type: 'column', attrs: { width: '1fr', className: '' } });
          }
        }
        return { id: null, type: 'columns', attrs: Object.assign({ columns: cols, gap: cfg.gap, text: cfg.text, className: cfg.className, align: cfg.align, children: children }, {}) };
      }
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
    ,
    /* Form and field blocks */
    form: {
      label: 'Form',
      fallbackIcon: '✉',
      category: 'Interactive',
      description: 'Form container block for fields and submission settings.',
      create: (attrs)=> ({ id:null, type:'form', attrs: Object.assign({ fields: [], layout: 'stack', submitAction: { type: 'swa', config: {} }, validationMode: 'inline', className: '' }, attrs||{}) }),
      render: (block)=>{
        const wrap = document.createElement('div'); wrap.className='pe-block-form';
        try{
          const header = document.createElement('div'); header.className = 'pe-form-header';
          const title = document.createElement('strong'); title.textContent = 'Form';
          const actions = document.createElement('div'); actions.className = 'pe-form-actions';

          const btnAdd = document.createElement('button'); btnAdd.type='button'; btnAdd.className='components-button components-primary'; btnAdd.textContent='Add field';
          function showFieldChooser(){
            const defs = window.EDITOR_BLOCK_DEFINITIONS || {};
            const choices = ['field_text','field_textarea','field_email','field_phone','field_number','field_select','field_radio','field_checkbox','field_checkbox_group','field_date','field_file','field_hidden'];
            // overlay
            const overlay = document.createElement('div'); overlay.className='pe-modal-overlay';
            Object.assign(overlay.style,{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 9999 });
            const dialog = document.createElement('div'); dialog.className='pe-modal-dialog';
            Object.assign(dialog.style,{ width:'480px', maxWidth:'95%', background:'#fff', borderRadius:'8px', padding:'16px', boxShadow:'0 8px 24px rgba(0,0,0,0.2)' });
            const h = document.createElement('h3'); h.textContent = 'Add field'; h.style.marginTop='0';
            const list = document.createElement('div'); list.className='pe-field-chooser-list'; list.style.display='grid'; list.style.gridTemplateColumns='1fr 1fr'; list.style.gap='8px'; list.style.maxHeight='240px'; list.style.overflow='auto'; list.style.marginBottom='12px';
            let selected = null;
            choices.forEach(key=>{
              const def = defs[key] || { label: key };
              const item = document.createElement('button'); item.type='button'; item.className='pe-field-chooser-item';
              item.style.padding='8px'; item.style.textAlign='left'; item.style.border='1px solid #e5e7eb'; item.style.borderRadius='6px'; item.style.background='#fff';
              item.textContent = def.label || key;
              item.addEventListener('click', ()=>{
                // mark selection
                selected = key;
                // highlight
                Array.from(list.children).forEach(ch=> ch.style.boxShadow='none');
                item.style.boxShadow = 'inset 0 0 0 2px #3b82f6';
                // set default label input
                labelInput.value = (def && def.create) ? ( (def.create().attrs && def.create().attrs.label) ? def.create().attrs.label : def.label || '') : def.label || '';
              });
              list.appendChild(item);
            });

            const labelWrap = document.createElement('div'); labelWrap.style.display='flex'; labelWrap.style.flexDirection='column'; labelWrap.style.gap='6px'; labelWrap.style.marginBottom='12px';
            const lblIn = document.createElement('label'); lblIn.textContent = 'Field label'; lblIn.style.fontSize='12px'; lblIn.style.color='#374151';
            const labelInput = document.createElement('input'); labelInput.type='text'; labelInput.placeholder='Label'; labelInput.style.padding='8px'; labelInput.style.border='1px solid #e5e7eb'; labelInput.style.borderRadius='6px';
            labelWrap.appendChild(lblIn); labelWrap.appendChild(labelInput);

            const foot = document.createElement('div'); foot.style.display='flex'; foot.style.justifyContent='flex-end'; foot.style.gap='8px';
            const btnCancel = document.createElement('button'); btnCancel.type='button'; btnCancel.className='components-button'; btnCancel.textContent='Cancel';
            const btnOk = document.createElement('button'); btnOk.type='button'; btnOk.className='components-button components-primary'; btnOk.textContent='Add';
            btnCancel.addEventListener('click', ()=>{ document.body.removeChild(overlay); });
            btnOk.addEventListener('click', ()=>{
              const sel = selected || choices[0];
              const def = defs[sel] || defs['field_text'];
              const newField = (typeof def.create === 'function') ? def.create() : { type: sel, attrs: {} };
              if (labelInput.value) newField.attrs = Object.assign({}, newField.attrs || {}, { label: labelInput.value });
              if (window.EditorCore && typeof EditorCore.createId === 'function') newField.id = EditorCore.createId('f'); else newField.id = 'f_' + Date.now();
              const next = (block.attrs && Array.isArray(block.attrs.fields)) ? block.attrs.fields.slice() : [];
              next.push(newField);
              if (window.EditorCore) EditorCore.setBlockAttrs(block.id, { fields: next });
              document.body.removeChild(overlay);
            });

            foot.appendChild(btnCancel); foot.appendChild(btnOk);
            dialog.appendChild(h); dialog.appendChild(list); dialog.appendChild(labelWrap); dialog.appendChild(foot);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            // focus
            labelInput.focus();
          }
          btnAdd.addEventListener('click', ()=>{ showFieldChooser(); });

          actions.appendChild(btnAdd);
          header.appendChild(title);
          header.appendChild(actions);
          // clicking header clears field selection
          header.addEventListener('click', (e)=>{ e.stopPropagation(); if (window.EditorCore) EditorCore.setBlockAttrs(block.id, { _selectedFieldId: null }); });
          wrap.appendChild(header);

          const list = document.createElement('div'); list.className = 'pe-form-fields';
          const fields = (block.attrs && Array.isArray(block.attrs.fields)) ? block.attrs.fields : [];
          const selectedFieldId = block.attrs && block.attrs._selectedFieldId ? block.attrs._selectedFieldId : null;
          fields.forEach((f, idx)=>{
            const fldWrap = document.createElement('div'); fldWrap.className = 'pe-form-field';
            const meta = document.createElement('div'); meta.className='pe-form-field-meta';
            const lbl = document.createElement('div'); lbl.className='pe-form-field-label'; lbl.textContent = f.attrs && f.attrs.label ? f.attrs.label : (f.type || 'field');
            const controls = document.createElement('div'); controls.className='pe-form-field-controls';

            const btnUp = document.createElement('button'); btnUp.type='button'; btnUp.title='Move up'; btnUp.textContent='↑';
            btnUp.addEventListener('click', (e)=>{ e.stopPropagation();
              const next = (block.attrs && Array.isArray(block.attrs.fields)) ? block.attrs.fields.slice() : [];
              if (idx <= 0) return;
              const [item] = next.splice(idx,1);
              next.splice(idx-1,0,item);
              if (window.EditorCore) EditorCore.setBlockAttrs(block.id, { fields: next });
            });

            const btnDown = document.createElement('button'); btnDown.type='button'; btnDown.title='Move down'; btnDown.textContent='↓';
            btnDown.addEventListener('click', (e)=>{ e.stopPropagation();
              const next = (block.attrs && Array.isArray(block.attrs.fields)) ? block.attrs.fields.slice() : [];
              if (idx >= next.length-1) return;
              const [item] = next.splice(idx,1);
              next.splice(idx+1,0,item);
              if (window.EditorCore) EditorCore.setBlockAttrs(block.id, { fields: next });
            });

            const btnEdit = document.createElement('button'); btnEdit.type='button'; btnEdit.title='Edit properties'; btnEdit.textContent='Edit';
            btnEdit.addEventListener('click', (e)=>{ e.stopPropagation();
              // open quick prompt to edit label/name
              const newLabel = window.prompt('Field label', f.attrs && f.attrs.label ? f.attrs.label : '');
              if (newLabel === null) return;
              const next = (block.attrs && Array.isArray(block.attrs.fields)) ? block.attrs.fields.slice() : [];
              next[idx] = Object.assign({}, next[idx], { attrs: Object.assign({}, next[idx].attrs || {}, { label: newLabel }) });
              if (window.EditorCore) EditorCore.setBlockAttrs(block.id, { fields: next });
            });

            const btnDel = document.createElement('button'); btnDel.type='button'; btnDel.title='Remove field'; btnDel.textContent='Remove';
            btnDel.addEventListener('click', (e)=>{ e.stopPropagation();
              if (!window.confirm('Remove field?')) return;
              const next = (block.attrs && Array.isArray(block.attrs.fields)) ? block.attrs.fields.slice() : [];
              next.splice(idx,1);
              if (window.EditorCore) EditorCore.setBlockAttrs(block.id, { fields: next, _selectedFieldId: (block.attrs && block.attrs._selectedFieldId===f.id) ? null : block.attrs && block.attrs._selectedFieldId });
            });

            controls.appendChild(btnUp); controls.appendChild(btnDown); controls.appendChild(btnEdit); controls.appendChild(btnDel);
            // only show controls for the selected field
            if (selectedFieldId !== f.id) controls.style.display = 'none';

            meta.appendChild(lbl); meta.appendChild(controls);
            fldWrap.appendChild(meta);
            // clicking a field selects it (for showing controls)
            fldWrap.addEventListener('click', (e)=>{ e.stopPropagation(); if (window.EditorCore) EditorCore.setBlockAttrs(block.id, { _selectedFieldId: f.id }); });

            // render field preview using definition renderer if available
            try{
              const defs = window.EDITOR_BLOCK_DEFINITIONS || {};
              const def = defs[f.type] || defs['field_text'];
              const preview = (def && typeof def.render === 'function') ? def.render(f) : document.createElement('div');
              preview.classList.add('pe-field-preview');
              fldWrap.appendChild(preview);
            }catch(e){}

            list.appendChild(fldWrap);
          });

          wrap.appendChild(list);
        }catch(e){ console.error('form render error', e); }
        return wrap;
      }
    },
    field_text: {
      label: 'Text Field',
      fallbackIcon: 'T',
      category: 'Interactive',
      description: 'Single-line text input field.',
      create: (attrs)=> ({ id:null, type:'field_text', attrs: Object.assign({ name: 'field', label: 'Text', placeholder: '', required: false, min: null, max: null, className: '' }, attrs||{}) }),
      render: (block)=>{ const wrap = document.createElement('div'); wrap.className='pe-field-text'; const label = document.createElement('label'); label.textContent = block.attrs && block.attrs.label? block.attrs.label : 'Text'; const input = document.createElement('input'); input.type='text'; input.placeholder = block.attrs && block.attrs.placeholder? block.attrs.placeholder : ''; wrap.appendChild(label); wrap.appendChild(input); return wrap; }
    },
    field_textarea: {
      label: 'Textarea Field',
      fallbackIcon: '📝',
      category: 'Interactive',
      description: 'Multi-line textarea field.',
      create: (attrs)=> ({ id:null, type:'field_textarea', attrs: Object.assign({ name: 'textarea', label: 'Long text', rows: 4, placeholder: '', required: false, className: '' }, attrs||{}) }),
      render: (block)=>{ const wrap = document.createElement('div'); wrap.className='pe-field-textarea'; const label = document.createElement('label'); label.textContent = block.attrs && block.attrs.label? block.attrs.label : 'Textarea'; const ta = document.createElement('textarea'); ta.rows = block.attrs && block.attrs.rows? block.attrs.rows : 4; wrap.appendChild(label); wrap.appendChild(ta); return wrap; }
    },
    field_email: {
      label: 'Email Field',
      fallbackIcon: '✉',
      category: 'Interactive',
      description: 'Email input with basic validation.',
      create: (attrs)=> ({ id:null, type:'field_email', attrs: Object.assign({ name: 'email', label: 'Email', placeholder: '', required: false, className: '' }, attrs||{}) }),
      render: (block)=>{ const wrap = document.createElement('div'); wrap.className='pe-field-email'; const label = document.createElement('label'); label.textContent = block.attrs && block.attrs.label? block.attrs.label : 'Email'; const input = document.createElement('input'); input.type='email'; wrap.appendChild(label); wrap.appendChild(input); return wrap; }
    },
    field_phone: {
      label: 'Phone Field',
      fallbackIcon: '☎',
      category: 'Interactive',
      description: 'Phone input with optional mask.',
      create: (attrs)=> ({ id:null, type:'field_phone', attrs: Object.assign({ name: 'phone', label: 'Phone', placeholder: '', required: false, className: '' }, attrs||{}) }),
      render: (block)=>{ const wrap = document.createElement('div'); wrap.className='pe-field-phone'; const label = document.createElement('label'); label.textContent = block.attrs && block.attrs.label? block.attrs.label : 'Phone'; const input = document.createElement('input'); input.type='tel'; wrap.appendChild(label); wrap.appendChild(input); return wrap; }
    },
    field_number: {
      label: 'Number Field',
      fallbackIcon: '#',
      category: 'Interactive',
      description: 'Numeric input field.',
      create: (attrs)=> ({ id:null, type:'field_number', attrs: Object.assign({ name: 'number', label: 'Number', min: null, max: null, step: 1, required: false, className: '' }, attrs||{}) }),
      render: (block)=>{ const wrap = document.createElement('div'); wrap.className='pe-field-number'; const label = document.createElement('label'); label.textContent = block.attrs && block.attrs.label? block.attrs.label : 'Number'; const input = document.createElement('input'); input.type='number'; wrap.appendChild(label); wrap.appendChild(input); return wrap; }
    },
    field_select: {
      label: 'Select Field',
      fallbackIcon: '▾',
      category: 'Interactive',
      description: 'Dropdown select field.',
      create: (attrs)=> ({ id:null, type:'field_select', attrs: Object.assign({ name: 'select', label: 'Choose', options: [{label:'Option 1',value:'1'}], required: false, className: '' }, attrs||{}) }),
      render: (block)=>{ const wrap = document.createElement('div'); wrap.className='pe-field-select'; const label = document.createElement('label'); label.textContent = block.attrs && block.attrs.label? block.attrs.label : 'Select'; const sel = document.createElement('select'); (block.attrs && block.attrs.options || []).forEach(o=>{ const opt = document.createElement('option'); opt.value = o.value; opt.textContent = o.label; sel.appendChild(opt); }); wrap.appendChild(label); wrap.appendChild(sel); return wrap; }
    },
    field_radio: {
      label: 'Radio Group',
      fallbackIcon: '◉',
      category: 'Interactive',
      description: 'Single-choice radio group.',
      create: (attrs)=> ({ id:null, type:'field_radio', attrs: Object.assign({ name: 'radio', label: 'Choose', options: [{label:'Yes',value:'yes'},{label:'No',value:'no'}], required: false, className: '' }, attrs||{}) }),
      render: (block)=>{ const wrap = document.createElement('div'); wrap.className='pe-field-radio'; const label = document.createElement('div'); label.textContent = block.attrs && block.attrs.label? block.attrs.label : 'Radio'; wrap.appendChild(label); (block.attrs && block.attrs.options || []).forEach(o=>{ const r = document.createElement('label'); const inp = document.createElement('input'); inp.type='radio'; inp.name = block.attrs && block.attrs.name? block.attrs.name : 'radio'; inp.value = o.value; r.appendChild(inp); r.appendChild(document.createTextNode(' '+o.label)); wrap.appendChild(r); }); return wrap; }
    },
    field_checkbox: {
      label: 'Checkbox',
      fallbackIcon: '☑',
      category: 'Interactive',
      description: 'Single checkbox field.',
      create: (attrs)=> ({ id:null, type:'field_checkbox', attrs: Object.assign({ name: 'checkbox', label: 'Check', required: false, className: '' }, attrs||{}) }),
      render: (block)=>{ const wrap = document.createElement('div'); wrap.className='pe-field-checkbox'; const label = document.createElement('label'); const inp = document.createElement('input'); inp.type='checkbox'; label.appendChild(inp); label.appendChild(document.createTextNode(' ' + (block.attrs && block.attrs.label? block.attrs.label : 'Check'))); wrap.appendChild(label); return wrap; }
    },
    field_checkbox_group: {
      label: 'Checkbox Group',
      fallbackIcon: '☐',
      category: 'Interactive',
      description: 'Multiple-choice checkbox group.',
      create: (attrs)=> ({ id:null, type:'field_checkbox_group', attrs: Object.assign({ name: 'checkboxes', label: 'Options', options: [{label:'A',value:'a'}], required: false, className: '' }, attrs||{}) }),
      render: (block)=>{ const wrap = document.createElement('div'); wrap.className='pe-field-checkbox-group'; const label = document.createElement('div'); label.textContent = block.attrs && block.attrs.label? block.attrs.label : 'Checkboxes'; wrap.appendChild(label); (block.attrs && block.attrs.options || []).forEach(o=>{ const r = document.createElement('label'); const inp = document.createElement('input'); inp.type='checkbox'; inp.value = o.value; r.appendChild(inp); r.appendChild(document.createTextNode(' '+o.label)); wrap.appendChild(r); }); return wrap; }
    },
    field_date: {
      label: 'Date Field',
      fallbackIcon: '📅',
      category: 'Interactive',
      description: 'Date picker field.',
      create: (attrs)=> ({ id:null, type:'field_date', attrs: Object.assign({ name: 'date', label: 'Date', required: false, className: '' }, attrs||{}) }),
      render: (block)=>{ const wrap = document.createElement('div'); wrap.className='pe-field-date'; const label = document.createElement('label'); label.textContent = block.attrs && block.attrs.label? block.attrs.label : 'Date'; const input = document.createElement('input'); input.type='date'; wrap.appendChild(label); wrap.appendChild(input); return wrap; }
    },
    field_file: {
      label: 'File Field',
      fallbackIcon: '📁',
      category: 'Interactive',
      description: 'File upload field for forms.',
      create: (attrs)=> ({ id:null, type:'field_file', attrs: Object.assign({ name: 'file', label: 'Upload', accept: '', multiple: false, required: false, className: '' }, attrs||{}) }),
      render: (block)=>{ const wrap = document.createElement('div'); wrap.className='pe-field-file'; const label = document.createElement('label'); label.textContent = block.attrs && block.attrs.label? block.attrs.label : 'Upload'; const input = document.createElement('input'); input.type='file'; wrap.appendChild(label); wrap.appendChild(input); return wrap; }
    },
    field_hidden: {
      label: 'Hidden Field',
      fallbackIcon: '◌',
      category: 'Interactive',
      description: 'Hidden input for metadata.',
      create: (attrs)=> ({ id:null, type:'field_hidden', attrs: Object.assign({ name: 'hidden', value: '', className: '' }, attrs||{}) }),
      render: (block)=>{ const inp = document.createElement('input'); inp.type='hidden'; inp.value = block.attrs && block.attrs.value? block.attrs.value : ''; return inp; }
    }
  };

  window.EDITOR_LEGACY_BLOCK_ORDER = [
    'paragraph','heading','code','list',
    'image','gallery','video','audio','file','media-text',
    'embed',
    'separator','group','stack','columns','column','row','grid','spacer','divider',
    'card','hero','background','icon','callout','accordion',
    'form',
    'field_text','field_textarea','field_email','field_phone','field_number','field_select','field_radio','field_checkbox','field_checkbox_group','field_date','field_file','field_hidden'
  ];
})();
