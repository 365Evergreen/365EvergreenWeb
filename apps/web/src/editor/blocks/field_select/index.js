(function () {
  const registry = window.EditorBlockRegistry;
  const modules = window.EditorBlockModules = window.EditorBlockModules || {};
  const runtime = window.EditorFormBlockRuntime || {};

  if (!registry || typeof registry.register !== 'function' || typeof runtime.registerFieldType !== 'function') return;

  const type = 'field_select';
  const defaults = { name: 'select', label: 'Choose', options: [{ label: 'Option 1', value: '1' }], required: false, className: '' };

  runtime.registerFieldType(type, { defaults });

  const blockModule = {
    create: (attrs) => runtime.createField
      ? runtime.createField(type, attrs)
      : { id: null, type, attrs: Object.assign({}, defaults, attrs || {}) },
    render: (block) => runtime.renderSelectField(block, 'pe-field-select', 'Select'),
    save: (block) => runtime.saveSelectField(block, 'pe-field-select', 'Select')
  };

  modules[type] = Object.assign({}, modules[type] || {}, blockModule);

  registry.register(type, {
    title: 'Select Field',
    label: 'Select Field',
    fallbackIcon: '▾',
    category: 'Interactive',
    description: 'Dropdown select field.',
    defaults: runtime.getFieldDefaults ? runtime.getFieldDefaults(type) : Object.assign({}, defaults),
    create: blockModule.create,
    render: blockModule.render,
    save: blockModule.save
  });
})();
