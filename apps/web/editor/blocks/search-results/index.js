(function () {
  const registry = window.EditorBlockRegistry;
  const blockModule = (window.EditorBlockModules && window.EditorBlockModules['search-results']) || {};

  if (!registry || typeof registry.register !== 'function') return;

  function createDefaults() {
    return {
      dataSource: '',
      template: 'card',
      columns: 3,
      pageSize: 6,
      showModified: true,
      showContributors: true,
      className: '',
      align: 'wide'
    };
  }

  function renderCard(index, attrs) {
    const card = document.createElement('article');
    card.className = 'pe-block-search-results__card';
    const title = document.createElement('strong');
    title.textContent = `Result ${index + 1}`;
    const meta = document.createElement('div');
    meta.className = 'pe-block-search-results__meta';
    meta.textContent = [attrs.showModified === false ? '' : 'Updated recently', attrs.showContributors === false ? '' : '2 contributors'].filter(Boolean).join(' • ');
    card.append(title, meta);
    return card;
  }

  function render(block) {
    if (typeof document === 'undefined') return null;
    const attrs = block && block.attrs ? block.attrs : {};
    const wrap = document.createElement('section');
    wrap.className = ['pe-block-search-results', attrs.align ? `align-${attrs.align}` : '', attrs.className || ''].join(' ').trim();
    wrap.style.gridTemplateColumns = `repeat(${Math.max(1, Number(attrs.columns) || 3)}, minmax(0, 1fr))`;
    const previewCount = Math.max(1, Math.min(Number(attrs.pageSize) || 6, 3));
    for (let index = 0; index < previewCount; index += 1) wrap.appendChild(renderCard(index, attrs));
    return wrap;
  }

  registry.register('search-results', {
    title: 'Search Results',
    label: 'Search Results',
    fallbackIcon: '▤',
    category: 'Interactive',
    description: 'Dynamic, filterable grid of search results with card templates.',
    defaults: createDefaults(),
    controls: blockModule.controls || {},
    popovers: blockModule.popovers || {},
    create: (attrs) => ({ id: null, type: 'search-results', attrs: Object.assign(createDefaults(), attrs || {}) }),
    render: typeof blockModule.render === 'function' ? blockModule.render : render,
    edit: typeof blockModule.edit === 'function' ? blockModule.edit : function () { return false; },
    save: typeof blockModule.save === 'function' ? blockModule.save : function () { return ''; }
  }, { after: 'accordion' });
})();
