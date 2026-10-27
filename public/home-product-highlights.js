(() => {
  'use strict';
  const section = document.getElementById('products');
  const grid = section && section.querySelector('.product-grid');
  if (!grid) return;

  function el(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }

  fetch('/product-catalog.json', { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) throw new Error('Catalogue request failed');
      return response.json();
    })
    .then(data => {
      if (!data || data.schemaVersion !== 1 || !Array.isArray(data.products) || !Array.isArray(data.groups)) {
        throw new Error('Unsupported catalogue data');
      }
      const groupNames = new Map(data.groups.map(group => [group.id, group.title]));
      const featured = data.products.filter(product => product.featured === true && product.name && product.url && product.group && product.status && product.access && product.platform);
      if (!featured.length) throw new Error('No featured products are configured');

      grid.replaceChildren();
      featured.slice(0, 4).forEach((product, index) => {
        const card = el('article', 'product-card' + (index === 0 ? ' product-card-featured' : ''));
        const top = el('div', 'product-top');
        const iconClass = product.group === 'apps' ? 'icon-violet' : product.group === 'extensions' ? 'icon-blue' : product.group === 'agents' ? 'icon-pink' : 'icon-blue';
        top.append(el('span', 'product-icon ' + iconClass, product.icon || '◇'));
        top.append(el('span', 'status-pill', product.status));
        card.append(top);
        card.append(el('div', 'product-kicker', groupNames.get(product.group) || product.type || 'YorpHives product'));
        card.append(el('h3', '', product.name));
        card.append(el('p', '', product.description));
        const metadata = el('div', 'home-product-meta');
        metadata.append(el('span', '', product.access));
        metadata.append(el('span', '', product.platform));
        card.append(metadata);
        const link = el('a', 'text-link', 'Explore product ↗');
        link.href = product.url;
        card.append(link);
        grid.append(card);
      });
      const status = section.querySelector('.home-product-source-status');
      if (status) status.textContent = 'Highlights and product details are maintained in the central catalogue.';
      grid.setAttribute('data-source', 'product-catalog.json');
    })
    .catch(error => {
      console.warn('Homepage product highlights kept their fallback content:', error);
    });
})();