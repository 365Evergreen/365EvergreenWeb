(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.audio = window.EditorBlockModules.audio || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value);
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = ['pe-block-audio', attrs.className || ''].join(' ').trim();
    const flags = `${attrs.autoplay ? ' autoplay' : ''}${attrs.loop ? ' loop' : ''}${attrs.preload ? ` preload="${attr(attrs.preload)}"` : ''}`;
    const meta = attrs.title || attrs.artist ? `<div class="pe-audio-meta">${attrs.title || ''}${attrs.artist ? ` - ${attrs.artist}` : ''}</div>` : '';
    return `<div class="${attr(className)}"><audio controls src="${attr(attrs.src || '')}"${flags}></audio>${meta}</div>`;
  };
})();
