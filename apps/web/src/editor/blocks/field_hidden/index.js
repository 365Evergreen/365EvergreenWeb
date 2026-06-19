(function () {
  const registry = window.EditorBlockRegistry;
  const modules = window.EditorBlockModules = window.EditorBlockModules || {};
  const runtime = window.EditorFormBlockRuntime || {};

  if (!registry || typeof registry.register !== 'function' || typeof runtime.registerFieldType !== 'function') return;

  const type = 'field_hidden';
  const defaults = { name: 'hidden', value: '', className: '' };

  runtime.registerFieldType(type, { defaults });

  const blockModule = {
    create: (attrs) => runtime.createField
      ? runtime.createField(type, attrs)
      : { id: null, type, attrs: Object.assign({}, defaults, attrs || {}) },
    render: (block) => runtime.renderHiddenField(block, 'pe-field-hidden'),
    save: (block) => runtime.saveHiddenField(block, 'pe-field-hidden')
  };

  modules[type] = Object.assign({}, modules[type] || {}, blockModule);

  registry.register(type, {
    title: 'Hidden Field',
    label: 'Hidden Field',
    fallbackIcon: '◌',
    category: 'Interactive',
    description: 'Hidden input for metadata.',
    defaults: runtime.getFieldDefaults ? runtime.getFieldDefaults(type) : Object.assign({}, defaults),
    create: blockModule.create,
    render: blockModule.render,
    save: blockModule.save
  });
})();
