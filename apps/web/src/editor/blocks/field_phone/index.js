(function () {
  const registry = window.EditorBlockRegistry;
  const modules = window.EditorBlockModules = window.EditorBlockModules || {};
  const runtime = window.EditorFormBlockRuntime || {};

  if (!registry || typeof registry.register !== 'function' || typeof runtime.registerFieldType !== 'function') return;

  const type = 'field_phone';
  const defaults = { name: 'phone', label: 'Phone', placeholder: '', required: false, className: '' };

  runtime.registerFieldType(type, { defaults });

  const blockModule = {
    create: (attrs) => runtime.createField
      ? runtime.createField(type, attrs)
      : { id: null, type, attrs: Object.assign({}, defaults, attrs || {}) },
    render: (block) => runtime.renderTextLikeField(block, 'pe-field-phone', 'tel', 'Phone'),
    save: (block) => runtime.saveTextLikeField(block, 'pe-field-phone', 'tel', 'Phone')
  };

  modules[type] = Object.assign({}, modules[type] || {}, blockModule);

  registry.register(type, {
    title: 'Phone Field',
    label: 'Phone Field',
    fallbackIcon: '☎',
    category: 'Interactive',
    description: 'Phone input with optional mask.',
    defaults: runtime.getFieldDefaults ? runtime.getFieldDefaults(type) : Object.assign({}, defaults),
    create: blockModule.create,
    render: blockModule.render,
    save: blockModule.save
  });
})();
