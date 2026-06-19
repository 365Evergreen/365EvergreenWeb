(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.list) || {};
  const listUtils = window.EditorListUtils || {};

  if (!registry || typeof registry.register !== 'function') return;

  function normalizeListItems(items) {
    return typeof listUtils.normalizeListItems === 'function'
      ? listUtils.normalizeListItems(items)
      : (Array.isArray(items) ? items : [{ content: '', children: [] }]);
  }

  function createListStyle(style) {
    return typeof listUtils.createListStyle === 'function'
      ? listUtils.createListStyle(style)
      : Object.assign({ typography: {}, spacing: { itemGap: '', indentWidth: '' } }, style || {});
  }

  function createDefaults() {
    return {
      ordered: false,
      items: normalizeListItems(),
      className: '',
      align: 'left',
      markerStyle: 'disc',
      style: createListStyle()
    };
  }

  registry.register('list', {
    title: 'List',
    label: 'List',
    fallbackIcon: '•',
    category: 'Text',
    description: 'Ordered or unordered list.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => {
      const nextAttrs = Object.assign(createDefaults(), attrs || {});
      nextAttrs.items = normalizeListItems(nextAttrs.items);
      nextAttrs.style = createListStyle(nextAttrs.style);
      nextAttrs.markerStyle = nextAttrs.markerStyle || (nextAttrs.ordered ? 'decimal' : 'disc');
      return { id: null, type: 'list', attrs: nextAttrs };
    },
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
