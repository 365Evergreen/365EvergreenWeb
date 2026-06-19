(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.callout) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      variant: 'info',
      title: 'Notice title',
      text: 'Important supporting message.',
      showIcon: true,
      className: '',
      align: 'wide'
    };
  }

  function resolveIcon(variant) {
    const icons = { info: 'ℹ', success: '✓', warning: '⚠', error: '⨯', tip: '✦' };
    return icons[String(variant || 'info').toLowerCase()] || 'ℹ';
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const wrap = document.createElement('aside');
    wrap.className = ['pe-block-callout', `is-variant-${attrs.variant || 'info'}`, attrs.align ? `align-${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    if (attrs.showIcon !== false) {
      const icon = document.createElement('span');
      icon.className = 'pe-block-callout__icon';
      icon.textContent = resolveIcon(attrs.variant);
      wrap.appendChild(icon);
    }
    const content = document.createElement('div');
    content.className = 'pe-block-callout__content';
    const title = document.createElement('strong');
    title.className = 'pe-block-callout__title';
    title.textContent = attrs.title || 'Notice title';
    const text = document.createElement('p');
    text.className = 'pe-block-callout__text';
    text.textContent = attrs.text || '';
    content.append(title, text);
    wrap.appendChild(content);
    return wrap;
  }

  registry.register('callout', {
    title: 'Callout',
    label: 'Callout',
    fallbackIcon: '!',
    category: 'Design',
    description: 'Notice block for tips, warnings, and status messages.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'callout', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  }, { after: 'icon' });
})();
