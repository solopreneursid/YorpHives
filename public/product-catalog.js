(() => {
  'use strict';
  const root = document.getElementById('product-catalog');
  if (!root) return;
  const input = document.getElementById('productSearch');
  const count = document.getElementById('productSearchCount');
  const groupsRoot = root.querySelector('.catalog-groups');
  const nav = root.querySelector('.catalog-type-nav');
  if (!groupsRoot || !input || !count) return;
  let products = [];
  let groups = [];
  let activeGroup = 'all';

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '/product-catalog.css?v=1';
  document.head.appendChild(style);

  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function render() {
    const query = input.value.trim().toLowerCase();
    const visible = products.filter(function (p) {
      const haystack = [p.name,p.type,p.description,p.platform,p.status,p.access,p.keywords].join(' ').toLowerCase();
      return (activeGroup === 'all' || p.group === activeGroup) && (!query || haystack.includes(query));
    });
    groupsRoot.replaceChildren();
    groups.forEach(function (group, index) {
      const items = visible.filter(function (p) { return p.group === group.id; });
      if (!items.length) return;
      const section = node('section','catalog-group');
      section.id = 'catalog-' + group.id;
      const head = node('div','catalog-group-head');
      const titleBox = node('div');
      titleBox.append(node('span','catalog-kicker',group.eyebrow),node('h3','',group.title));
      head.append(titleBox,node('span','catalog-count',items.length + (items.length === 1 ? ' item' : ' items')));
      const cards = node('div','catalog-cards');
      items.forEach(function (p) {
        const card = node('a','catalog-card');
        card.href = p.url;
        card.dataset.productId = p.id;
        card.append(node('span','catalog-icon',p.icon || '◇'));
        card.append(node('span','catalog-type',p.type.toUpperCase()));
        card.append(node('h4','',p.name));
        card.append(node('p','',p.description));
        const meta = node('div','catalog-meta');
        meta.append(node('span','status',p.status),node('span','access',p.access));
        card.append(meta);
        card.append(node('span','catalog-platform','Works on: ' + p.platform));
        card.append(node('span','catalog-link',p.status.toLowerCase().includes('download') || p.status.toLowerCase().includes('install') ? 'View details & access ↗' : 'Open product ↗'));
        cards.append(card);
      });
      section.append(head,cards);
      if (group.id === 'extensions') section.append(node('p','catalog-note','Extensions are currently distributed as manual-install packages, not store-reviewed listings. Review each package’s permissions before installing.'));
      if (group.id === 'agents') section.append(node('p','catalog-note','Assistants are user-invoked and rule-based unless a product explicitly states otherwise. They do not independently browse or run as autonomous cloud agents.'));
      if (group.id === 'plugins') section.append(node('p','catalog-note','WordPress plugins are distributed as installable packages. The VS Code integration is a source package, not a signed Marketplace release.'));
      groupsRoot.append(section);
    });
    const empty = node('p','empty-state','No products match those filters. Try a different search or category.');
    empty.id = 'productSearchEmpty';
    empty.hidden = visible.length > 0;
    groupsRoot.append(empty);
    count.textContent = visible.length + ' of ' + products.length + ' products' + (query ? ' matching your search' : '');
    root.querySelectorAll('[data-catalog-filter]').forEach(function (button) {
      const selected = button.dataset.catalogFilter === activeGroup;
      button.setAttribute('aria-pressed',String(selected));
    });
    if (nav) nav.querySelectorAll('a[href^="#catalog-"]').forEach(function (a) {
      const id = a.getAttribute('href').slice('#catalog-'.length);
      a.hidden = !visible.some(function (p) { return p.group === id; });
    });
  }
  function syncStructuredData() {
    const script = document.querySelector('script[type="application/ld+json"]');
    if (!script) return;
    try {
      const graph = JSON.parse(script.textContent);
      const itemList = (graph['@graph'] || []).find(function(item){return item['@type'] === 'ItemList';});
      if (itemList) itemList.itemListElement = products.map(function(p,index){return {'@type':'ListItem',position:index+1,name:p.name,url:new URL(p.url,location.origin).href};});
      script.textContent = JSON.stringify(graph);
    } catch (error) {
      console.warn('Could not sync product catalogue structured data:',error);
    }
  }
  function addFilters() {
    const bar = node('div','catalog-filter-bar');
    bar.setAttribute('role','group');
    bar.setAttribute('aria-label','Filter products by type');
    const options = [{id:'all',label:'All products'}].concat(groups.map(function(g){return {id:g.id,label:g.title.replace(' & workspaces','').replace(' & integrations','').replace(' & assistants','')}}));
    options.forEach(function (option) {
      const button = node('button','catalog-filter',option.label);
      button.type = 'button';
      button.dataset.catalogFilter = option.id;
      button.setAttribute('aria-pressed',String(option.id === activeGroup));
      button.addEventListener('click',function(){activeGroup=option.id;render();});
      bar.append(button);
    });
    if (nav) nav.insertAdjacentElement('afterend',bar);
  }
  fetch('/product-catalog.json',{cache:'no-cache'})
    .then(function(response){if(!response.ok)throw new Error('Catalogue unavailable');return response.json();})
    .then(function(data){
      if (!data || data.schemaVersion !== 1 || !Array.isArray(data.products) || !Array.isArray(data.groups)) throw new Error('Catalogue schema is not supported');
      products = data.products.filter(function(p){return p.id&&p.name&&p.group&&p.url&&p.description&&p.status&&p.access;});
      groups = data.groups;
      syncStructuredData();
      if (!products.length) throw new Error('Catalogue is empty');
      addFilters();
      input.addEventListener('input',render);
      input.addEventListener('search',render);
      render();
    })
    .catch(function(error){
      console.warn('YorpHives catalogue fallback:',error);
      count.textContent = 'Showing the available product list';
      const existing = root.querySelectorAll('.catalog-card');
      existing.forEach(function(card){
        if(!card.querySelector('.catalog-meta')){
          const meta=node('div','catalog-meta');
          meta.append(node('span','status','See product page'),node('span','access','Access details vary'));
          const link=card.querySelector('.catalog-link');
          (link||card).insertAdjacentElement('beforebegin',meta);
        }
      });
    });
})();