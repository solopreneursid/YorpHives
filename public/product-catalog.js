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
  style.href = '/product-catalog.css?v=2';
  document.head.appendChild(style);

  function node(tag, className, value) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  }
  function validateCatalog(data) {
    const errors = [];
    const statuses = ['planned', 'testing', 'available', 'maintenance', 'retired'];
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.products) || !Array.isArray(data.groups)) {
      return ['Unsupported catalogue structure or schema version.'];
    }
    const groupIds = data.groups.map(g => g.id);
    if (new Set(groupIds).size !== groupIds.length) errors.push('Duplicate category IDs.');
    const ids = data.products.map(p => p.id);
    if (new Set(ids).size !== ids.length) errors.push('Duplicate product IDs.');
    data.products.forEach((p, i) => {
      const label = p.name || ('Product #' + (i + 1));
      ['id','name','type','group','description','url','status','access','platform','keywords','lifecycleStatus','compatibilityNotes','installation','permissions','verification'].forEach(key => {
        if (typeof p[key] !== 'string' || !p[key].trim()) errors.push(label + ': missing ' + key + '.');
      });
      if (!groupIds.includes(p.group)) errors.push(label + ': unknown category ' + p.group + '.');
      if (!statuses.includes(p.lifecycleStatus)) errors.push(label + ': invalid lifecycle status.');
      if (typeof p.url === 'string' && (!p.url.startsWith('/') || p.url.startsWith('//'))) errors.push(label + ': destination must be a same-site path.');
      if (p.verification && !['verified','not-independently-verified','needs-retest'].includes(p.verification)) errors.push(label + ': invalid verification value.');
    });
    return errors;
  }
  async function validateDestinations(items) {
    const pages = new Map();
    items.forEach(function (p) {
      try {
        const url = new URL(p.url, location.origin);
        if (url.origin !== location.origin) {
          p.destinationHealth = 'external-path-rejected';
          return;
        }
        const pathname = url.pathname;
        if (!pages.has(pathname)) pages.set(pathname, fetch(pathname, {cache:'no-cache'}).then(async function(response) {
          if (!response.ok) return {ok:false, html:''};
          return {ok:true, html:await response.text()};
        }).catch(function(){return {ok:false,html:''};}));
      } catch (_) {
        p.destinationHealth = 'invalid-url';
      }
    });
    const checked = new Map();
    await Promise.all(Array.from(pages.entries()).map(async function(entry) {
      checked.set(entry[0], await entry[1]);
    }));
    items.forEach(function(p) {
      if (p.destinationHealth) return;
      try {
        const url = new URL(p.url, location.origin);
        const page = checked.get(url.pathname);
        if (!page || !page.ok) {
          p.destinationHealth = 'route-missing';
          return;
        }
        if (url.hash) {
          const doc = new DOMParser().parseFromString(page.html, 'text/html');
          const anchor = decodeURIComponent(url.hash.slice(1));
          const hasId = !!doc.getElementById(anchor);
          const hasWorkbenchTool = url.pathname.endsWith('/workbench.html') && anchor.startsWith('tool-') && !!doc.querySelector('[data-tool="' + anchor.slice(5).replace(/"/g, '') + '"]');
          if (!hasId && !hasWorkbenchTool) {
            p.destinationHealth = 'anchor-missing';
            return;
          }
        }
        p.destinationHealth = 'ok';
      } catch (_) {
        p.destinationHealth = 'check-failed';
      }
    });
  }
  function render() {
    const query = input.value.trim().toLowerCase();
    const visible = products.filter(function (p) {
      const haystack = [p.name,p.type,p.description,p.platform,p.status,p.access,p.keywords,p.lifecycleStatus,p.compatibilityNotes,p.installation].join(' ').toLowerCase();
      return (activeGroup === 'all' || p.group === activeGroup) && (!query || haystack.includes(query));
    });
    groupsRoot.replaceChildren();
    groups.forEach(function (group) {
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
        const card = node('article','catalog-card');
        card.dataset.productId = p.id;
        card.append(node('span','catalog-icon',p.icon || '◇'));
        card.append(node('span','catalog-type',p.type.toUpperCase()));
        card.append(node('h4','',p.name));
        card.append(node('p','',p.description));
        const meta = node('div','catalog-meta');
        meta.append(node('span','status',p.lifecycleStatus.charAt(0).toUpperCase() + p.lifecycleStatus.slice(1)));
        meta.append(node('span','access',p.access));
        if (p.destinationHealth && p.destinationHealth !== 'ok') meta.append(node('span','destination-warning','Destination check: ' + p.destinationHealth.replace(/-/g,' ')));
        card.append(meta);
        card.append(node('span','catalog-platform','Compatibility: ' + p.compatibilityNotes));
        const disclosure = node('details','catalog-release-details');
        disclosure.append(node('summary','','Installation & permissions'));
        const details = node('div','catalog-release-copy');
        details.append(node('p','','Installation: ' + p.installation));
        details.append(node('p','','Permissions / capabilities: ' + p.permissions));
        details.append(node('p','','Release verification: ' + p.verification.replace(/-/g,' ')));
        disclosure.append(details);
        card.append(disclosure);
        const productLink = node('a','catalog-link',p.lifecycleStatus === 'planned' ? 'View roadmap ↗' : p.lifecycleStatus === 'retired' ? 'View archive / replacement ↗' : 'View product & access ↗');
        productLink.href = p.destinationHealth === 'ok' ? p.url : '#';
        if (p.destinationHealth && p.destinationHealth !== 'ok') {
          productLink.setAttribute('aria-disabled','true');
          productLink.addEventListener('click',function(event){event.preventDefault();});
          productLink.textContent = 'Destination needs review';
        }
        card.append(productLink);
        cards.append(card);
      });
      section.append(head,cards);
      if (group.id === 'extensions') section.append(node('p','catalog-note','Extensions are distributed as manual-install packages, not store-reviewed listings. Review each package’s permissions before installing.'));
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
      button.setAttribute('aria-pressed',String(button.dataset.catalogFilter === activeGroup));
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
      if (itemList) itemList.itemListElement = products.filter(p => p.lifecycleStatus !== 'retired').map(function(p,index){return {'@type':'ListItem',position:index+1,name:p.name,url:new URL(p.url,location.origin).href};});
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
    .then(async function(data){
      const errors = validateCatalog(data);
      if (errors.length) {
        console.error('Product catalogue validation failed:',errors);
        throw new Error('Catalogue metadata validation failed (' + errors.length + ' issue(s)).');
      }
      products = data.products;
      groups = data.groups;
      await validateDestinations(products);
      syncStructuredData();
      if (!products.length) throw new Error('Catalogue is empty');
      addFilters();
      input.addEventListener('input',render);
      input.addEventListener('search',render);
      render();
      const destinationIssues = products.filter(function(p){return p.destinationHealth !== 'ok';});
      root.dataset.catalogValidation = destinationIssues.length ? 'passed-with-warnings' : 'passed';
      if (destinationIssues.length) console.error('Product destination checks need attention:',destinationIssues.map(function(p){return {id:p.id,url:p.url,issue:p.destinationHealth};}));
    })
    .catch(function(error){
      console.warn('YorpHives catalogue fallback:',error);
      count.textContent = 'Showing the available product list';
      root.dataset.catalogValidation = 'failed';
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