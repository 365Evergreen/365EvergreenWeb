(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.group) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      title: 'Section heading',
      text: '',
      tag: 'section',
      layout: 'stack',
      backgroundColor: '',
      textColor: '',
      padding: '2rem 1.5rem',
      margin: '',
      className: '',
      align: 'wide',
      children: []
    };
  }

  function saveChildren(children) {
    const runtimeUtils = window.EditorBlockRuntimeUtils || {};
    return typeof runtimeUtils.saveBlocks === 'function' ? runtimeUtils.saveBlocks(children || []) : '';
  }

  function getTag(tag) {
    return /^[a-z][a-z0-9-]*$/i.test(String(tag || '')) ? String(tag) : 'section';
  }

  function appendIntro(wrap, attrs, hasChildren) {
    const showTitle = !hasChildren || (attrs.title && attrs.title !== 'Section heading');
    const showText = !hasChildren || !!attrs.text;
    if (showTitle) {
      const title = document.createElement('h2');
      title.className = 'pe-block-group__title';
      title.textContent = attrs.title || 'Section heading';
      wrap.appendChild(title);
    }
    if (showText && attrs.text) {
      const text = document.createElement('p');
      text.className = 'pe-block-group__text';
      text.textContent = attrs.text;
      wrap.appendChild(text);
    }
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const tag = getTag(attrs.tag);
    const wrap = document.createElement(tag);
    wrap.className = [
      'pe-block-group',
      `is-layout-${attrs.layout || 'stack'}`,
      attrs.className || ''
    ].join(' ').trim();
    if (attrs.backgroundColor) wrap.style.backgroundColor = attrs.backgroundColor;
    if (attrs.textColor) wrap.style.color = attrs.textColor;
    if (attrs.padding) wrap.style.padding = attrs.padding;
    if (attrs.margin) wrap.style.margin = attrs.margin;

    const childrenMarkup = saveChildren(attrs.children);
    appendIntro(wrap, attrs, !!childrenMarkup);
    if (childrenMarkup) {
      const content = document.createElement('div');
      content.className = 'pe-block-group__content';
      content.innerHTML = childrenMarkup;
      wrap.appendChild(content);
    } else {
      const empty = document.createElement('div');
      empty.className = 'pe-block-group__empty';
      empty.textContent = 'Group container';
      wrap.appendChild(empty);
    }
    return wrap;
  }

  registry.register('group', {
    title: 'Group',
    label: 'Group',
    fallbackIcon: '[]',
    category: 'Design',
    description: 'Section wrapper for grouped content.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'group', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  });
})();
