(function () {
  const registry = window.EditorBlockRegistry;
  const modules = window.EditorBlockModules = window.EditorBlockModules || {};
  const runtime = window.EditorFormBlockRuntime || {};

  if (!registry || typeof registry.register !== 'function' || typeof runtime.registerFieldType !== 'function') return;

  const type = 'field_checkbox_group';
  const defaults = { name: 'checkboxes', label: 'Options', options: [{ label: 'A', value: 'a' }], required: false, className: '' };

  runtime.registerFieldType(type, { defaults });

  const blockModule = {
    create: (attrs) => runtime.createField
      ? runtime.createField(type, attrs)
      : { id: null, type, attrs: Object.assign({}, defaults, attrs || {}) },
    render: (block) => runtime.renderChoiceField(block, 'pe-field-checkbox-group', 'checkbox', 'Checkboxes'),
    save: (block) => runtime.saveChoiceField(block, 'pe-field-checkbox-group', 'checkbox', 'Options')
  };

  modules[type] = Object.assign({}, modules[type] || {}, blockModule);

  registry.register(type, {
    title: 'Checkbox Group',
    label: 'Checkbox Group',
    fallbackIcon: '☐',
    category: 'Interactive',
    description: 'Multiple-choice checkbox group.',
    defaults: runtime.getFieldDefaults ? runtime.getFieldDefaults(type) : Object.assign({}, defaults),
    create: blockModule.create,
    render: blockModule.render,
    save: blockModule.save
  });
})();
