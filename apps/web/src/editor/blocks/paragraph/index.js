(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.paragraph) || {};
  const textUtils = window.EditorTextStyleUtils || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      text: '',
      align: 'left',
      className: '',
      style: typeof textUtils.createTextStyle === 'function' ? textUtils.createTextStyle() : {}
    };
  }

  registry.register('paragraph', {
    title: 'Paragraph',
    label: 'Paragraph',
    fallbackIcon: 'P',
    category: 'Text',
    description: 'Body copy with inline formatting.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'paragraph', attrs: Object.assign(createDefaults(), attrs || {}) }),
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
