(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.video) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      src: '',
      caption: '',
      poster: '',
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      className: '',
      align: 'wide'
    };
  }

  registry.register('video', {
    title: 'Video',
    label: 'Video',
    fallbackIcon: 'V',
    category: 'Media',
    description: 'Video source with optional caption.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'video', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: (block) => {
      if (typeof document === 'undefined') return null;
      const attrs = block && block.attrs ? block.attrs : {};
      const wrap = document.createElement('figure');
      wrap.className = ['pe-block-video', attrs.className || ''].join(' ').trim();
      const video = document.createElement('video');
      video.src = attrs.src || '';
      if (attrs.poster) video.poster = attrs.poster;
      video.controls = attrs.controls !== false;
      video.autoplay = !!attrs.autoplay;
      video.loop = !!attrs.loop;
      video.muted = !!attrs.muted;
      wrap.appendChild(video);
      if (attrs.caption) {
        const caption = document.createElement('figcaption');
        caption.textContent = attrs.caption;
        wrap.appendChild(caption);
      }
      return wrap;
    },
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
