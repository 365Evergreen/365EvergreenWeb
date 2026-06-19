(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules.accordion) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      title: 'Accordion item',
      text: 'Collapsible content summary',
      open: false,
      showIcon: true,
      className: '',
      align: 'wide'
    };
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const wrap = document.createElement('details');
    wrap.className = ['pe-block-accordion', attrs.align ? `align-${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    wrap.open = !!attrs.open;
    const summary = document.createElement('summary');
    summary.className = 'pe-block-accordion__summary';
    summary.dataset.accordionToggle = 'true';
    if (attrs.showIcon !== false) {
      const icon = document.createElement('span');
      icon.className = 'pe-block-accordion__icon';
      icon.textContent = '⌄';
      summary.appendChild(icon);
    }
    const label = document.createElement('span');
    label.textContent = attrs.title || 'Accordion item';
    summary.appendChild(label);
    const content = document.createElement('div');
    content.className = 'pe-block-accordion__content';
    const text = document.createElement('p');
    text.textContent = attrs.text || '';
    content.appendChild(text);
    wrap.append(summary, content);
    return wrap;
  }

  registry.register('accordion', {
    title: 'Accordion',
    label: 'Accordion',
    fallbackIcon: '⌄',
    category: 'Interactive',
    description: 'Collapsible shell block for grouped content.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'accordion', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  }, { after: 'callout' });
})();
