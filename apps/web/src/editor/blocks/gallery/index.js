(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.gallery) || {};
  const galleryUtils = window.EditorGalleryUtils || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      images: [],
      columns: 3,
      crop: true,
      linkTo: 'none',
      lightbox: false,
      style: typeof galleryUtils.createGalleryStyle === 'function' ? galleryUtils.createGalleryStyle() : {},
      className: ''
    };
  }

  registry.register('gallery', {
    title: 'Gallery',
    label: 'Gallery',
    fallbackIcon: '☷',
    category: 'Media',
    description: 'Responsive grid of images.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => {
      const nextAttrs = Object.assign(createDefaults(), attrs || {});
      if (typeof galleryUtils.normalizeGalleryImages === 'function') nextAttrs.images = galleryUtils.normalizeGalleryImages(nextAttrs.images);
      if (typeof galleryUtils.clampGalleryColumns === 'function') nextAttrs.columns = galleryUtils.clampGalleryColumns(nextAttrs.columns);
      nextAttrs.crop = nextAttrs.crop !== false;
      nextAttrs.linkTo = ['none', 'media', 'attachment'].includes(nextAttrs.linkTo) ? nextAttrs.linkTo : 'none';
      if (typeof galleryUtils.createGalleryStyle === 'function') nextAttrs.style = galleryUtils.createGalleryStyle(nextAttrs.style);
      return { id: null, type: 'gallery', attrs: nextAttrs };
    },
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
