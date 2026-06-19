(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.cover = window.EditorBlockModules.cover || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};
  const FEATURED_IMAGE_TOKEN = '__featured_image__';

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value || '');
  }

  function html(value) {
    return typeof htmlUtils.escapeHtml === 'function' ? htmlUtils.escapeHtml(value) : String(value || '');
  }

  function inline(styleObject) {
    return typeof htmlUtils.toInlineStyle === 'function' ? htmlUtils.toInlineStyle(styleObject) : '';
  }

  function saveChildren(children, options) {
    const runtimeUtils = window.EditorBlockRuntimeUtils || {};
    return typeof runtimeUtils.saveBlocks === 'function' ? runtimeUtils.saveBlocks(children || [], options || {}) : '';
  }

  function resolveSource(background) {
    if (!background || !background.src) return '';
    if (background.src !== FEATURED_IMAGE_TOKEN) return background.src;
    if (!window.EditorCore || typeof window.EditorCore.getPage !== 'function') return '';
    const page = window.EditorCore.getPage();
    return page && page.attrs && page.attrs.featuredImage ? String(page.attrs.featuredImage).trim() : '';
  }

  function positionStyle(position) {
    const value = String(position || 'center center').trim().toLowerCase();
    const parts = value.split(/\s+/);
    const vertical = parts[0] || 'center';
    const horizontal = parts[1] || 'center';
    const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
    const alignMap = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
    return {
      'justify-content': justifyMap[horizontal] || 'center',
      'align-items': alignMap[vertical] || 'center',
      'text-align': horizontal === 'left' ? 'left' : (horizontal === 'right' ? 'right' : 'center')
    };
  }

  module.save = function (block, options) {
    const attrs = block && block.attrs ? block.attrs : {};
    const background = Object.assign({
      type: null,
      src: null,
      alt: '',
      poster: '',
      focalPoint: { x: 0.5, y: 0.5 },
      fixed: false,
      autoplay: true,
      loop: true
    }, attrs.background || {});
    const overlay = Object.assign({ color: '#000000', opacity: 0.5 }, attrs.overlay || {});
    const layout = attrs.style && attrs.style.layout ? attrs.style.layout : 'default';
    const className = ['pe-block-cover', background.type && resolveSource(background) ? 'has-media' : 'is-empty', layout && layout !== 'default' ? `align-${layout}` : '', attrs.className || ''].join(' ').trim();
    const rootStyle = inline({ 'min-height': attrs.minHeight || '50vh' });
    const rootStyleAttr = rootStyle ? ` style="${attr(rootStyle)}"` : '';
    const source = resolveSource(background);
    let mediaMarkup = '<div class="pe-block-cover__media pe-block-cover__media--empty"></div>';
    if (background.type === 'image' && source) {
      const mediaStyle = inline({
        'background-image': `url(${source})`,
        'background-position': `${(background.focalPoint && background.focalPoint.x !== undefined ? background.focalPoint.x : 0.5) * 100}% ${(background.focalPoint && background.focalPoint.y !== undefined ? background.focalPoint.y : 0.5) * 100}%`,
        'background-attachment': background.fixed ? 'fixed' : 'scroll'
      });
      mediaMarkup = `<div class="pe-block-cover__media pe-block-cover__media--image"${mediaStyle ? ` style="${attr(mediaStyle)}"` : ''}${background.alt ? ` role="img" aria-label="${attr(background.alt)}"` : ''}></div>`;
    } else if (background.type === 'video' && source) {
      mediaMarkup = `<div class="pe-block-cover__media pe-block-cover__media--video"><video class="pe-block-cover__video" src="${attr(source)}"${background.poster ? ` poster="${attr(background.poster)}"` : ''}${background.autoplay !== false ? ' autoplay' : ''}${background.loop !== false ? ' loop' : ''} muted playsinline aria-hidden="true"></video></div>`;
    }
    const overlayStyle = inline({ background: overlay.color || '#000000', opacity: Number(overlay.opacity) });
    const contentStyle = inline(positionStyle(attrs.contentPosition));
    return [
      `<section class="${attr(className)}"${rootStyleAttr}>`,
      mediaMarkup,
      `<div class="pe-block-cover__overlay"${overlayStyle ? ` style="${attr(overlayStyle)}"` : ''}></div>`,
      `<div class="pe-block-cover__content"${contentStyle ? ` style="${attr(contentStyle)}"` : ''}>`,
      '<div class="pe-block-cover__content-inner">',
      saveChildren(attrs.children, options),
      '</div>',
      '</div>',
      '</section>'
    ].join('');
  };
})();
