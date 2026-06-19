(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.video = window.EditorBlockModules.video || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value);
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    const className = ['pe-block-video', attrs.className || ''].join(' ').trim();
    const flags = `${attrs.autoplay ? ' autoplay' : ''}${attrs.loop ? ' loop' : ''}${attrs.muted ? ' muted' : ''}${attrs.controls !== false ? ' controls' : ''}`;
    const poster = attrs.poster ? ` poster="${attr(attrs.poster)}"` : '';
    const video = `<video src="${attr(attrs.src || '')}"${poster}${flags}></video>`;
    const caption = attrs.caption ? `<figcaption>${attrs.caption}</figcaption>` : '';
    return `<figure class="${attr(className)}">${video}${caption}</figure>`;
  };
})();
