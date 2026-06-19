(function () {
  window.EditorBlockModules = window.EditorBlockModules || {};
  const module = window.EditorBlockModules['search-results'] = window.EditorBlockModules['search-results'] || {};

  module.controls = {
    toolbar: ['align', 'more'],
    inspector: {
      settings: ['dataSource', 'template', 'columns', 'pageSize', 'showModified', 'showContributors'],
      advanced: ['className']
    }
  };
  module.popovers = module.popovers || {};
  module.popovers.query = {
    id: 'search-results-query',
    title: 'Results query',
    fields: ['dataSource', 'template', 'columns', 'pageSize']
  };
})();
