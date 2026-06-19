(function () {
  const registry = window.EditorBlockRegistry;
  const modules = window.EditorBlockModules = window.EditorBlockModules || {};
  const runtime = window.EditorFormBlockRuntime || {};

  if (!registry || typeof registry.register !== 'function' || typeof runtime.registerFieldType !== 'function') return;

  const type = 'field_text';
  const defaults = { name: 'field', label: 'Text', placeholder: '', required: false, min: null, max: null, className: '' };

  runtime.registerFieldType(type, { defaults });

  const blockModule = {
    create: (attrs) => runtime.createField
      ? runtime.createField(type, attrs)
      : { id: null, type, attrs: Object.assign({}, defaults, attrs || {}) },
    render: (block) => runtime.renderTextLikeField(block, 'pe-field-text', 'text', 'Text'),
    save: (block) => runtime.saveTextLikeField(block, 'pe-field-text', 'text', 'Text')
  };

  modules[type] = Object.assign({}, modules[type] || {}, blockModule);

  registry.register(type, {
    title: 'Text Field',
    label: 'Text Field',
    fallbackIcon: 'T',
    category: 'Interactive',
    description: 'Single-line text input field.',
    defaults: runtime.getFieldDefaults ? runtime.getFieldDefaults(type) : Object.assign({}, defaults),
    create: blockModule.create,
    render: blockModule.render,
    save: blockModule.save
  });
})();
