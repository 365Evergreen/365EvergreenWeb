(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.heading) || {};
  const textUtils = window.EditorTextStyleUtils || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      text: 'Heading',
      level: 2,
      align: 'left',
      style: typeof textUtils.createTextStyle === 'function' ? textUtils.createTextStyle() : {}
    };
  }

  registry.register('heading', {
    title: 'Heading',
    label: 'Heading',
    fallbackIcon: 'H',
    category: 'Text',
    description: 'Section title with level control.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'heading', attrs: Object.assign(createDefaults(), attrs || {}) }),
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
