(function () {
  const registry = window.EditorBlockRegistry;
  const modules = window.EditorBlockModules = window.EditorBlockModules || {};
  const runtime = window.EditorFormBlockRuntime || {};

  if (!registry || typeof registry.register !== 'function' || typeof runtime.registerFieldType !== 'function') return;

  const type = 'field_radio';
  const defaults = { name: 'radio', label: 'Choose', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }], required: false, className: '' };

  runtime.registerFieldType(type, { defaults });

  const blockModule = {
    create: (attrs) => runtime.createField
      ? runtime.createField(type, attrs)
      : { id: null, type, attrs: Object.assign({}, defaults, attrs || {}) },
    render: (block) => runtime.renderChoiceField(block, 'pe-field-radio', 'radio', 'Radio'),
    save: (block) => runtime.saveChoiceField(block, 'pe-field-radio', 'radio', 'Choose')
  };

  modules[type] = Object.assign({}, modules[type] || {}, blockModule);

  registry.register(type, {
    title: 'Radio Group',
    label: 'Radio Group',
    fallbackIcon: '◉',
    category: 'Interactive',
    description: 'Single-choice radio group.',
    defaults: runtime.getFieldDefaults ? runtime.getFieldDefaults(type) : Object.assign({}, defaults),
    create: blockModule.create,
    render: blockModule.render,
    save: blockModule.save
  });
})();
