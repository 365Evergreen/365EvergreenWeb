(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.cover) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      background: {
        type: null,
        src: null,
        alt: '',
        poster: '',
        focalPoint: { x: 0.5, y: 0.5 },
        fixed: false,
        autoplay: true,
        loop: true
      },
      overlay: {
        color: '#000000',
        opacity: 0.5
      },
      minHeight: '50vh',
      contentPosition: 'center center',
      children: [],
      style: {
        layout: 'default',
        spacing: {}
      },
      className: ''
    };
  }

  function normalizeBackground(background) {
    const base = createDefaults().background;
    const next = Object.assign({}, base, background || {});
    const focalPoint = next.focalPoint && typeof next.focalPoint === 'object' ? next.focalPoint : {};
    next.focalPoint = {
      x: typeof focalPoint.x === 'number' ? focalPoint.x : 0.5,
      y: typeof focalPoint.y === 'number' ? focalPoint.y : 0.5
    };
    return next;
  }

  function normalizeAttrs(attrs) {
    const defaults = createDefaults();
    const next = Object.assign({}, defaults, attrs || {});
    next.background = normalizeBackground(next.background);
    next.overlay = Object.assign({}, defaults.overlay, next.overlay || {});
    next.style = Object.assign({}, defaults.style, next.style || {});
    next.children = Array.isArray(next.children) ? next.children : [];
    return next;
  }

  function resolveBackgroundSource(background) {
    if (!background || !background.src) return '';
    if (background.src !== '__featured_image__') return background.src;
    if (!window.EditorCore || typeof window.EditorCore.getPage !== 'function') return '';
    const page = window.EditorCore.getPage();
    return page && page.attrs && page.attrs.featuredImage ? String(page.attrs.featuredImage).trim() : '';
  }

  function getPositionStyle(position) {
    const value = String(position || 'center center').trim().toLowerCase();
    const parts = value.split(/\s+/);
    const vertical = parts[0] || 'center';
    const horizontal = parts[1] || 'center';
    const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
    const alignMap = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
    return {
      justifyContent: justifyMap[horizontal] || 'center',
      alignItems: alignMap[vertical] || 'center',
      textAlign: horizontal === 'left' ? 'left' : (horizontal === 'right' ? 'right' : 'center')
    };
  }

  function appendMediaControls(container) {
    const actions = document.createElement('div');
    actions.className = 'pe-block-cover__media-actions';
    [
      ['Upload', 'upload'],
      ['Media Library', 'library'],
      ['Use Featured Image', 'featured'],
      ['Insert URL', 'url']
    ].forEach(function (entry) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = entry[1] === 'upload' ? 'primary' : 'secondary';
      button.dataset.coverAction = entry[1];
      button.textContent = entry[0];
      actions.appendChild(button);
    });
    container.appendChild(actions);
  }

  function appendCanvasActions(container) {
    const actions = document.createElement('div');
    actions.className = 'pe-block-cover__content-actions';
    const browse = document.createElement('button');
    browse.type = 'button';
    browse.className = 'primary';
    browse.dataset.coverBrowse = 'true';
    browse.textContent = 'Browse blocks';
    actions.appendChild(browse);
    const quick = document.createElement('button');
    quick.type = 'button';
    quick.className = 'secondary';
    quick.dataset.coverQuickAdd = 'paragraph';
    quick.textContent = 'Add paragraph';
    actions.appendChild(quick);
    container.appendChild(actions);
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = normalizeAttrs(block && block.attrs ? block.attrs : {});
    const background = attrs.background;
    const source = resolveBackgroundSource(background);
    const hasMedia = !!(background.type && source);
    const layout = attrs.style && attrs.style.layout ? attrs.style.layout : 'default';
    const wrap = document.createElement('section');
    wrap.className = [
      'pe-block-cover',
      hasMedia ? 'has-media' : 'is-empty',
      layout && layout !== 'default' ? 'align-' + layout : '',
      attrs.className || ''
    ].join(' ').trim();
    wrap.style.minHeight = attrs.minHeight || '50vh';

    const media = document.createElement('div');
    media.className = 'pe-block-cover__media';
    if (hasMedia && background.type === 'image') {
      media.classList.add('pe-block-cover__media--image');
      media.dataset.coverFocalTarget = 'true';
      media.style.backgroundImage = `url("${source}")`;
      media.style.backgroundPosition = `${(background.focalPoint.x || 0.5) * 100}% ${(background.focalPoint.y || 0.5) * 100}%`;
      media.style.backgroundAttachment = background.fixed ? 'fixed' : 'scroll';
      if (background.alt) {
        media.setAttribute('role', 'img');
        media.setAttribute('aria-label', background.alt);
      }
      const focal = document.createElement('span');
      focal.className = 'pe-block-cover__focal-point';
      focal.dataset.coverFocalHandle = 'true';
      focal.style.left = `${(background.focalPoint.x || 0.5) * 100}%`;
      focal.style.top = `${(background.focalPoint.y || 0.5) * 100}%`;
      media.appendChild(focal);
    } else if (hasMedia && background.type === 'video') {
      media.classList.add('pe-block-cover__media--video');
      const video = document.createElement('video');
      video.className = 'pe-block-cover__video';
      video.src = source;
      if (background.poster) video.poster = background.poster;
      video.autoplay = background.autoplay !== false;
      video.loop = background.loop !== false;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('aria-hidden', 'true');
      media.appendChild(video);
    } else {
      media.classList.add('pe-block-cover__media--empty');
      const placeholder = document.createElement('div');
      placeholder.className = 'pe-block-cover__placeholder';
      placeholder.innerHTML = '<strong>Cover background</strong><p>Upload an image or video, browse the media library, use the featured image, or insert a URL.</p>';
      appendMediaControls(placeholder);
      media.appendChild(placeholder);
    }
    wrap.appendChild(media);

    const overlay = document.createElement('div');
    overlay.className = 'pe-block-cover__overlay';
    const opacity = Math.max(0, Math.min(1, Number(attrs.overlay && attrs.overlay.opacity)));
    const color = attrs.overlay && attrs.overlay.color ? attrs.overlay.color : '#000000';
    overlay.style.background = color;
    overlay.style.opacity = String(Number.isFinite(opacity) ? opacity : 0.5);
    wrap.appendChild(overlay);

    const content = document.createElement('div');
    content.className = 'pe-block-cover__content';
    const contentPosition = getPositionStyle(attrs.contentPosition);
    content.style.justifyContent = contentPosition.justifyContent;
    content.style.alignItems = contentPosition.alignItems;
    content.style.textAlign = contentPosition.textAlign;

    const contentInner = document.createElement('div');
    contentInner.className = 'pe-block-cover__content-inner';
    const toolbar = document.createElement('div');
    toolbar.className = 'pe-block-cover__toolbar';
    const summary = document.createElement('div');
    summary.className = 'pe-block-cover__summary';
    summary.innerHTML = `<strong>Cover</strong><span>${background.type || 'No media'} · ${attrs.minHeight || '50vh'} · ${Array.isArray(attrs.children) ? attrs.children.length : 0} block(s)</span>`;
    toolbar.appendChild(summary);
    if (hasMedia) appendMediaControls(toolbar);
    contentInner.appendChild(toolbar);

    const childCanvas = document.createElement('div');
    childCanvas.className = 'pe-block-cover__canvas';
    childCanvas.dataset.coverCanvas = 'true';
    if (window.EditorCore && typeof window.EditorCore.renderTree === 'function') {
      window.EditorCore.renderTree(attrs.children || [], childCanvas);
    }
    if (!childCanvas.children.length) {
      const empty = document.createElement('div');
      empty.className = 'pe-block-cover__content-empty';
      empty.innerHTML = '<p>Add hero content inside this cover.</p>';
      appendCanvasActions(empty);
      childCanvas.appendChild(empty);
    }
    contentInner.appendChild(childCanvas);

    const hint = document.createElement('p');
    hint.className = 'pe-block-cover__hint';
    hint.textContent = 'Select a block in this cover or browse blocks to keep inserting into the cover canvas.';
    contentInner.appendChild(hint);
    content.appendChild(contentInner);
    wrap.appendChild(content);
    return wrap;
  }

  registry.register('cover', {
    title: 'Cover',
    label: 'Cover',
    fallbackIcon: '▤',
    category: 'Media',
    description: 'Hero-style media section with overlay and nested content.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'cover', attrs: normalizeAttrs(attrs) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  }, { after: 'media-text' });
})();
