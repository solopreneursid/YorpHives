(() => {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const links = [
    {label:'Home', href:'/', key:'home'},
    {label:'Products', href:'/products.html', key:'products'},
    {label:'Free Tools', href:'/free-tools.html#directory', key:'tools'},
    {label:'Workbench', href:'/workbench.html', key:'workbench'},
    {label:'QuickPanel', href:'/quickpanel/', key:'quickpanel'}
  ];
  const more = [
    {label:'Extensions',href:'/browser-extension.html',key:'extensions'},
    {label:'PDF & Images',href:'/tools.html',key:'media'},
    {label:'Services',href:'/#services',key:'services'},
    {label:'About',href:'/#about',key:'about'}
  ];
  const active = path === '/' ? 'home' : path === '/products.html' ? 'products' : path === '/free-tools.html' ? 'tools' : path === '/workbench.html' ? 'workbench' : path.startsWith('/quickpanel') ? 'quickpanel' : path === '/browser-extension.html' ? 'extensions' : path === '/tools.html' ? 'media' : 'tools';
  const style = document.createElement('style');
  style.id = 'yorphives-shared-nav-style';
  style.textContent = `
    .site-header{position:sticky!important;top:0;z-index:1000;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:16px clamp(20px,3vw,44px);background:rgba(8,8,14,.94)!important;backdrop-filter:blur(16px);border-bottom:1px solid #242333!important}
    .site-header .brand{flex-shrink:0;text-decoration:none}
    .site-header #mainNav{display:flex;align-items:center;gap:clamp(12px,1.7vw,28px)}
    .site-header #mainNav a{color:#b9b8c9;text-decoration:none;white-space:nowrap;font-size:14px;transition:color .18s ease}
    .site-header #mainNav a:hover,.site-header #mainNav a[aria-current="page"]{color:#c5b4ff}
    .site-header #mainNav a[aria-current="page"]{text-decoration:underline;text-decoration-color:#9b83ff;text-underline-offset:7px}
    .site-header #mainNav .nav-cta{color:#f4f1ff;border:1px solid #49435f;border-radius:10px;padding:12px 16px}
    .site-header #mainNav .nav-cta:hover{border-color:#9b83ff;background:#151321}
    .site-header .yh-more{position:relative}
    .site-header .yh-more summary{list-style:none;cursor:pointer;color:#b9b8c9;font-size:14px;white-space:nowrap}
    .site-header .yh-more summary::-webkit-details-marker{display:none}
    .site-header .yh-more summary:after{content:'⌄';margin-left:7px;color:#a99bff}
    .site-header .yh-more[open] .yh-more-menu{display:grid}
    .site-header .yh-more-menu{display:none;position:absolute;right:0;top:calc(100% + 14px);min-width:190px;padding:8px;background:#11111b;border:1px solid #343148;border-radius:12px;box-shadow:0 18px 45px #0008;gap:2px}
    .site-header .yh-more-menu a{padding:11px 12px;border-radius:7px}
    .site-header .yh-more-menu a:hover{background:#211d32}
    .yh-menu-toggle{display:none;background:transparent;color:#eee;border:1px solid #38354a;border-radius:9px;padding:8px 11px;font-size:20px;cursor:pointer}
    .site-footer .footer-links{display:flex;flex-wrap:wrap;gap:12px 22px}
    .site-footer .footer-links a{color:#b9b8c9;text-decoration:none}
    .site-footer .footer-links a:hover{color:#c5b4ff}
    @media(max-width:1050px){
      .yh-menu-toggle{display:inline-flex;align-items:center;justify-content:center}
      .site-header{position:sticky!important}
      .site-header #mainNav{display:none;position:absolute;top:100%;left:0;right:0;padding:16px 20px 22px;background:#0c0b13;border-bottom:1px solid #343148;box-shadow:0 18px 35px #0005;align-items:stretch;gap:0;flex-direction:column}
      .site-header #mainNav.yh-nav-open{display:flex}
      .site-header #mainNav>a,.site-header #mainNav .yh-more>summary{display:block;padding:12px 8px}
      .site-header #mainNav .nav-cta{margin-top:8px;text-align:center}
      .site-header .yh-more-menu{position:static;box-shadow:none;margin:4px 0 8px;min-width:0}
      .site-header .yh-more[open] .yh-more-menu{display:grid}
    }
  `;
  if (!document.getElementById(style.id)) document.head.appendChild(style);
  const nav = document.querySelector('#mainNav');
  const header = nav?.closest('.site-header') || nav?.parentElement;
  if (nav && header) {
    nav.innerHTML = '';
    links.forEach(item => {
      const a = document.createElement('a');
      a.href = item.href; a.textContent = item.label;
      if (item.key === active) a.setAttribute('aria-current','page');
      nav.appendChild(a);
    });
    const details = document.createElement('details');
    details.className = 'yh-more';
    const summary = document.createElement('summary'); summary.textContent = 'More';
    const menu = document.createElement('div'); menu.className = 'yh-more-menu';
    more.forEach(item => {
      const a = document.createElement('a'); a.href = item.href; a.textContent = item.label;
      if (item.key === active) a.setAttribute('aria-current','page');
      menu.appendChild(a);
    });
    details.append(summary,menu); nav.appendChild(details);
    const cta = document.createElement('a'); cta.className='nav-cta'; cta.href='/#request'; cta.append(document.createTextNode('Start a project ↗')); nav.appendChild(cta);
    const oldToggle = header.querySelector('.menu-toggle');
    if (oldToggle) oldToggle.remove();
    let toggle = header.querySelector('.yh-menu-toggle');
    if (!toggle) { toggle=document.createElement('button'); toggle.className='yh-menu-toggle'; toggle.type='button'; toggle.setAttribute('aria-label','Open navigation'); toggle.setAttribute('aria-expanded','false'); toggle.textContent='☰'; nav.before(toggle); }
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('yh-nav-open');
      toggle.setAttribute('aria-expanded',String(open));
      toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
      toggle.textContent=open?'×':'☰';
    });
    nav.addEventListener('click', e => {
      if (e.target.closest('a')) { nav.classList.remove('yh-nav-open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open navigation'); toggle.textContent='☰'; }
    });
    document.addEventListener('click', e => { if (!details.contains(e.target)) details.open=false; });
    document.addEventListener('keydown', e => { if (e.key==='Escape') { details.open=false; nav.classList.remove('yh-nav-open'); toggle.setAttribute('aria-expanded','false'); toggle.textContent='☰'; }});
  }
  document.querySelectorAll('footer.site-footer').forEach(footer => {
    const linksBox=footer.querySelector('.footer-links');
    if (!linksBox) return;
    linksBox.innerHTML = [
      ['Home','/'],['Products','/products.html'],['Free Tools','/free-tools.html#directory'],
      ['Workbench','/workbench.html'],['QuickPanel','/quickpanel/'],['Extensions','/browser-extension.html'],
      ['PDF & Images','/tools.html'],['Services','/#services'],['About','/#about'],['Start a project','/#request']
    ].map(([label,href])=>'<a href="'+href+'">'+label+'</a>').join('');
  });
})();