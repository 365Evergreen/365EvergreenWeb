(function () {
  const registry = window.EditorBlockRegistry;
  const modules = window.EditorBlockModules || {};
  const runtime = window.EditorFormBlockRuntime || {};

  if (!registry || typeof registry.register !== 'function') return;

  const formModule = modules.form || {};
  registry.register('form', {
    create: typeof formModule.create === 'function' ? formModule.create : runtime.createForm,
    render: typeof formModule.render === 'function' ? formModule.render : function () { return null; },
    save: typeof formModule.save === 'function' ? formModule.save : function () { return ''; }
  });

  (runtime.fieldTypes || []).forEach((type) => {
    const blockModule = modules[type] || {};
    registry.register(type, {
      create: typeof blockModule.create === 'function' ? blockModule.create : function (attrs) {
        return runtime.createField ? runtime.createField(type, attrs) : { id: null, type, attrs: attrs || {} };
      },
      render: typeof blockModule.render === 'function' ? blockModule.render : function () { return null; },
      save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
    });
  });
})();
