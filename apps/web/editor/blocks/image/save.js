(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules.image = window.EditorBlockModules.image || {};
  const htmlUtils = window.EditorBlockHtmlUtils || {};

  function attr(value) {
    return typeof htmlUtils.escapeAttribute === 'function' ? htmlUtils.escapeAttribute(value) : String(value);
  }

  module.save = (block) => {
    const attrs = block && block.attrs ? block.attrs : {};
    if (!attrs.src) return '<figure class="pe-block-image is-empty"></figure>';
    const className = ['pe-block-image', attrs.className || ''].join(' ').trim();
    const sizeAttrs = `${attrs.width ? ` width="${attr(attrs.width)}"` : ''}${attrs.height ? ` height="${attr(attrs.height)}"` : ''}`;
    const loadingAttr = attrs.loading ? ` loading="${attr(attrs.loading)}"` : '';
    const imgStyle = [];
    if (attrs.focalPoint && (attrs.focalPoint.x !== undefined || attrs.focalPoint.y !== undefined)) {
      imgStyle.push(`object-position:${attrs.focalPoint.x || 50}% ${attrs.focalPoint.y || 50}%`);
      imgStyle.push('object-fit:cover');
    }
    if (attrs.style && attrs.style.radius) imgStyle.push(`border-radius:${attrs.style.radius}`);
    if (attrs.style && attrs.style.border) imgStyle.push(`border:${attrs.style.border}`);
    const imgStyleAttr = imgStyle.length ? ` style="${attr(imgStyle.join(';'))}"` : '';
    const imageMarkup = `<img src="${attr(attrs.src)}" alt="${attr(attrs.alt || '')}"${sizeAttrs}${loadingAttr}${imgStyleAttr}>`;
    const linkedMarkup = attrs.link && attrs.link.href
      ? `<a href="${attr(attrs.link.href)}"${attrs.link.target ? ` target="${attr(attrs.link.target)}"` : ''} rel="noreferrer noopener">${imageMarkup}</a>`
      : imageMarkup;
    const caption = attrs.caption ? `<figcaption class="pe-image-caption">${attrs.caption}</figcaption>` : '';
    return `<figure class="${attr(className)}">${linkedMarkup}${caption}</figure>`;
  };
})();
