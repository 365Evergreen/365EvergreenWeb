(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.code) || {};
  const textUtils = window.EditorTextStyleUtils || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    const baseStyle = typeof textUtils.createTextStyle === 'function'
      ? textUtils.createTextStyle({ backgroundColor: '#0f172a', textColor: '#f8fafc' })
      : { backgroundColor: '#0f172a', textColor: '#f8fafc' };

    return {
      code: '',
      language: '',
      align: 'left',
      style: baseStyle
    };
  }

  registry.register('code', {
    title: 'Code',
    label: 'Code',
    fallbackIcon: '{}',
    category: 'Text',
    description: 'Preformatted code block.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'code', attrs: Object.assign(createDefaults(), attrs || {}) }),
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
