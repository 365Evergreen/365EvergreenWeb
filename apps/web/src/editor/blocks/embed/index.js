(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.embed) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      url: '',
      html: '',
      provider: '',
      caption: '',
      aspectRatio: '16x9',
      className: '',
      align: 'wide'
    };
  }

  function getAspectRatioStyle(value) {
    const match = String(value || '').trim().match(/^(\d+(?:\.\d+)?)\s*[x/:]\s*(\d+(?:\.\d+)?)$/i);
    if (!match) return '16 / 9';
    return `${match[1]} / ${match[2]}`;
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const wrap = document.createElement('figure');
    wrap.className = ['pe-block-embed', attrs.align ? `align-${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    const frame = document.createElement('div');
    frame.className = 'pe-block-embed__frame';
    frame.style.aspectRatio = getAspectRatioStyle(attrs.aspectRatio);
    if (attrs.html) {
      frame.classList.add('pe-block-embed__html');
      frame.innerHTML = attrs.html;
    } else if (attrs.url) {
      const iframe = document.createElement('iframe');
      iframe.src = attrs.url;
      iframe.title = attrs.provider || attrs.caption || 'Embedded content';
      iframe.loading = 'lazy';
      iframe.setAttribute('allowfullscreen', 'true');
      frame.appendChild(iframe);
    } else {
      const empty = document.createElement('div');
      empty.className = 'pe-block-embed__empty';
      empty.textContent = 'Embed content';
      frame.appendChild(empty);
    }
    wrap.appendChild(frame);
    if (attrs.caption) {
      const caption = document.createElement('figcaption');
      caption.className = 'pe-block-embed__caption';
      caption.textContent = attrs.caption;
      wrap.appendChild(caption);
    }
    return wrap;
  }

  registry.register('embed', {
    title: 'Embed',
    label: 'Embed',
    fallbackIcon: '</>',
    category: 'Embed',
    description: 'Trusted embed HTML or source URL.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'embed', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  }, { after: 'media-text' });
})();
