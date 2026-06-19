(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.drawer) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      position: 'right',
      width: '400px',
      overlay: true,
      closeOnOutside: true,
      trigger: { type: 'button', label: 'Open Drawer', style: {} },
      className: '',
      children: []
    };
  }

  function saveChildren(children) {
    const runtimeUtils = window.EditorBlockRuntimeUtils || {};
    return typeof runtimeUtils.saveBlocks === 'function' ? runtimeUtils.saveBlocks(children || []) : '';
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const runtime = window.EditorDrawerRuntime || {};
    const isOpen = typeof runtime.isDrawerOpen === 'function' ? runtime.isDrawerOpen(block && block.id) : false;
    const trigger = attrs.trigger && typeof attrs.trigger === 'object' ? attrs.trigger : {};
    const triggerLabel = trigger.label || 'Open Drawer';
    const wrap = document.createElement('div');
    wrap.className = ['pe-block-drawer', isOpen ? 'is-open' : '', attrs.overlay === false ? 'is-overlay-disabled' : '', attrs.className || ''].join(' ').trim();

    const preview = document.createElement('div');
    preview.className = 'pe-block-drawer__preview';
    const meta = document.createElement('div');
    meta.className = 'pe-block-drawer__meta';
    meta.innerHTML = `<strong>Drawer (${attrs.position === 'left' ? 'Left' : 'Right'})</strong><span>${attrs.width || '400px'} · ${Array.isArray(attrs.children) ? attrs.children.length : 0} block(s)</span>`;
    preview.appendChild(meta);
    const actions = document.createElement('div');
    actions.className = 'pe-block-drawer__actions';
    const triggerButton = document.createElement('button');
    triggerButton.type = 'button';
    triggerButton.className = 'pe-drawer-trigger primary';
    triggerButton.dataset.drawerTrigger = 'true';
    triggerButton.textContent = triggerLabel;
    actions.appendChild(triggerButton);
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'pe-drawer-edit secondary';
    editButton.dataset.drawerEdit = 'true';
    editButton.textContent = isOpen ? 'Editing drawer' : 'Edit Drawer';
    actions.appendChild(editButton);
    preview.appendChild(actions);
    wrap.appendChild(preview);

    if (isOpen) {
      const shell = document.createElement('div');
      shell.className = ['site-drawer', 'pe-drawer-shell', attrs.overlay === false ? 'is-overlay-disabled' : ''].join(' ').trim();
      shell.setAttribute('open', '');
      if (attrs.width) shell.style.setProperty('--site-drawer-width', attrs.width);
      if (attrs.overlay !== false) {
        const backdrop = document.createElement('div');
        backdrop.className = 'site-drawer-backdrop pe-drawer-backdrop';
        backdrop.dataset.drawerBackdrop = 'true';
        shell.appendChild(backdrop);
      }
      const panel = document.createElement('aside');
      panel.className = 'site-drawer-panel pe-drawer-panel pe-drawer-panel--' + (attrs.position || 'right');
      panel.dataset.drawerPanel = 'true';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-labelledby', `drawer-title-${block.id}`);

      const header = document.createElement('div');
      header.className = 'site-drawer-header pe-drawer-panel__header';
      const title = document.createElement('h2');
      title.className = 'site-drawer-title pe-drawer-panel__title';
      title.id = `drawer-title-${block.id}`;
      title.textContent = triggerLabel;
      header.appendChild(title);
      const dismiss = document.createElement('button');
      dismiss.type = 'button';
      dismiss.className = 'site-drawer-close pe-drawer-dismiss';
      dismiss.dataset.drawerDismiss = 'true';
      dismiss.setAttribute('aria-label', 'Dismiss drawer');
      dismiss.innerHTML = typeof runtime.getDismissIcon === 'function' ? runtime.getDismissIcon() : '&times;';
      header.appendChild(dismiss);
      panel.appendChild(header);

      const content = document.createElement('div');
      content.className = 'site-drawer-body pe-drawer-panel__content';
      const childCanvas = document.createElement('div');
      childCanvas.className = 'pe-drawer-canvas';
      childCanvas.dataset.drawerCanvas = 'true';
      if (window.EditorCore && typeof window.EditorCore.renderTree === 'function') {
        window.EditorCore.renderTree(attrs.children || [], childCanvas);
      }
      if (!childCanvas.children.length) {
        const empty = document.createElement('div');
        empty.className = 'pe-drawer-canvas__empty';
        empty.innerHTML = '<p>Add blocks to this drawer from the block inserter.</p>';
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'pe-drawer-add primary';
        add.dataset.drawerAdd = 'true';
        add.textContent = 'Browse blocks';
        empty.appendChild(add);
        const quickAdd = document.createElement('button');
        quickAdd.type = 'button';
        quickAdd.className = 'pe-drawer-quick-add secondary';
        quickAdd.dataset.drawerQuickAdd = 'paragraph';
        quickAdd.textContent = 'Add paragraph';
        empty.appendChild(quickAdd);
        childCanvas.appendChild(empty);
      }
      content.appendChild(childCanvas);
      const hint = document.createElement('p');
      hint.className = 'pe-drawer-panel__hint';
      hint.textContent = 'Drawer Canvas — inserts now go into this drawer until it is closed.';
      content.appendChild(hint);
      panel.appendChild(content);
      const footer = document.createElement('div');
      footer.className = 'site-drawer-footer pe-drawer-panel__footer';
      const footerActions = document.createElement('div');
      footerActions.className = 'pe-drawer-panel__actions';
      const browse = document.createElement('button');
      browse.type = 'button';
      browse.className = 'pe-drawer-add primary';
      browse.dataset.drawerAdd = 'true';
      browse.textContent = 'Browse blocks';
      footerActions.appendChild(browse);
      const quickAddFooter = document.createElement('button');
      quickAddFooter.type = 'button';
      quickAddFooter.className = 'pe-drawer-quick-add secondary';
      quickAddFooter.dataset.drawerQuickAdd = 'paragraph';
      quickAddFooter.textContent = 'Add paragraph';
      footerActions.appendChild(quickAddFooter);
      footer.appendChild(footerActions);
      panel.appendChild(footer);
      shell.appendChild(panel);
      wrap.appendChild(shell);
    }
    return wrap;
  }

  registry.register('drawer', {
    title: 'Drawer',
    label: 'Drawer',
    fallbackIcon: '[]',
    category: 'Interactive',
    description: 'Hidden drawer panel that contains nested blocks.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'drawer', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function (entry) { return saveChildren(entry && entry.attrs && entry.attrs.children || []); }
  });
})();
