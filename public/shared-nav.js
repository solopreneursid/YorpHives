(() => {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const links = [
    {label:'Home',href:'/',key:'home'},
    {label:'Apps & Products',href:'/products.html',key:'products'},
    {label:'Free Tools',href:'/free-tools.html',key:'tools'},
    {label:'Workbench',href:'/workbench.html',key:'workbench'},
    {label:'Extensions',href:'/browser-extension.html',key:'extensions'},
    {label:'Plugins',href:'/plugins.html',key:'plugins'}
  ];
  const more = [
    {label:'QuickPanel',href:'/quickpanel/',key:'quickpanel'},
    {label:'PDF & Images',href:'/tools.html',key:'media'},
    {label:'File Conversion Workspace',href:'/file-workspace.html',key:'fileworkspace'},
    {label:'Services',href:'/services.html',key:'services'},
    {label:'Portfolio',href:'/portfolio.html',key:'portfolio'},
    {label:'About',href:'/#about',key:'about'},
    {label:'FAQ',href:'/#faq',key:'faq'},
    {label:'Contact / Enquiries',href:'/#request',key:'contact'}
  ];
  const active = path==='/'?'home':path==='/services.html'?'services':path==='/portfolio.html'?'portfolio':path==='/products.html'?'products':path==='/free-tools.html'?'tools':path==='/workbench.html'?'workbench':path.startsWith('/quickpanel')?'quickpanel':path==='/browser-extension.html'?'extensions':path==='/plugins.html'?'plugins':path==='/tools.html'?'media':path==='/file-workspace.html'?'fileworkspace':'tools';
  if(!document.querySelector('link[href^="/tech-wizard.css"]')){const theme=document.createElement('link');theme.rel='stylesheet';theme.href='/tech-wizard.css?v=1';document.head.appendChild(theme)}
  if(!document.querySelector('link[data-yh-font-preconnect]')){const pre=document.createElement('link');pre.rel='preconnect';pre.href='https://fonts.googleapis.com';pre.dataset.yhFontPreconnect='true';document.head.appendChild(pre);const pre2=document.createElement('link');pre2.rel='preconnect';pre2.href='https://fonts.gstatic.com';pre2.crossOrigin='anonymous';document.head.appendChild(pre2);const fonts=document.createElement('link');fonts.rel='stylesheet';fonts.href='https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;650;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap';fonts.dataset.yhFontPreconnect='true';document.head.appendChild(fonts)}
  if(!document.querySelector('link[data-yh-unified-polish]')){const polish=document.createElement('link');polish.rel='stylesheet';polish.href='/site-wide-polish.css?v=2';polish.dataset.yhUnifiedPolish='true';document.head.appendChild(polish)}
  const style=document.createElement('style');style.id='yorphives-shared-nav-style';
  style.textContent=`
    .site-header{position:sticky!important;top:0;z-index:1000;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:13px clamp(18px,3vw,44px);background:rgba(8,8,14,.96)!important;backdrop-filter:blur(16px);border-bottom:1px solid #242333!important}
    .site-header .brand{flex-shrink:0;text-decoration:none}
    .site-header #mainNav{display:flex;align-items:center;gap:clamp(10px,1.45vw,22px)}
    .site-header #mainNav a{color:#b9b8c9;text-decoration:none;white-space:nowrap;font-size:13px;transition:color .18s ease}
    .site-header #mainNav a:hover,.site-header #mainNav a[aria-current=page]{color:#d1c4ff}
    .site-header #mainNav a[aria-current=page]{text-decoration:underline;text-decoration-color:#9b83ff;text-underline-offset:7px}
    .site-header #mainNav .nav-cta{color:#f4f1ff;border:1px solid #49435f;border-radius:10px;padding:10px 13px}
    .site-header .yh-install-app{display:none;align-items:center;justify-content:center;gap:7px;background:linear-gradient(105deg,#b39bff,#7da9ff);color:#0b0c15!important;border:0;border-radius:9px;padding:10px 13px;font-weight:800;cursor:pointer;font-size:12px}
    .site-header .yh-install-app.yh-install-visible{display:inline-flex}
    .yh-pwa-hint{position:fixed;z-index:2000;left:50%;bottom:20px;transform:translateX(-50%);max-width:min(92vw,520px);padding:12px 16px;border:1px solid #48415f;border-radius:12px;background:#11111b;color:#f4f1ff;box-shadow:0 12px 35px #0009;font-size:13px}
    .site-header .yh-more{position:relative}
    .site-header .yh-more summary{list-style:none;cursor:pointer;color:#b9b8c9;font-size:13px;white-space:nowrap;padding:8px 0}
    .site-header .yh-more summary::-webkit-details-marker{display:none}
    .site-header .yh-more summary:after{content:'⌄';margin-left:7px;color:#a99bff}
    .site-header .yh-more[open] .yh-more-menu{display:grid}
    .site-header .yh-more-menu{display:none;position:absolute;right:0;top:calc(100% + 12px);min-width:190px;padding:8px;background:#11111b;border:1px solid #343148;border-radius:12px;box-shadow:0 18px 45px #0008;gap:2px}
    .site-header .yh-more-menu a{padding:11px 12px;border-radius:7px}
    .site-header .yh-more-menu a:hover{background:#211d32}
    .yh-menu-toggle{display:none;background:transparent;color:#eee;border:1px solid #38354a;border-radius:9px;padding:8px 11px;font-size:20px;cursor:pointer}
    .site-footer .footer-links{display:flex;flex-wrap:wrap;gap:12px 22px}
    .site-footer .footer-links a{color:#b9b8c9;text-decoration:none}
    .site-footer .footer-links a:hover{color:#c5b4ff}
    .yh-breadcrumb{max-width:1320px;margin:0 auto;padding:14px clamp(20px,4vw,48px) 0;color:#85869b;font-size:11px}
    .yh-breadcrumb ol{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0}
    .yh-breadcrumb li+li:before{content:'/';margin-right:8px;color:#55546b}
    .yh-breadcrumb a{color:#b9b0e7;text-decoration:none}.yh-breadcrumb a:hover{text-decoration:underline}
    @media(max-width:1050px){
      .yh-menu-toggle{display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px}
      .site-header #mainNav{display:none;position:absolute;top:100%;left:0;right:0;padding:14px 20px 22px;background:#0c0b13;border-bottom:1px solid #343148;box-shadow:0 18px 35px #0005;align-items:stretch;gap:0;flex-direction:column;max-height:calc(100vh - 70px);overflow-y:auto}
      .site-header #mainNav.yh-nav-open{display:flex}
      .site-header #mainNav>a,.site-header #mainNav .yh-more>summary{display:flex;align-items:center;min-height:44px;padding:9px 8px}
      .site-header #mainNav .nav-cta{justify-content:center;margin-top:8px}
      .site-header .yh-more-menu{position:static;box-shadow:none;margin:4px 0 8px;min-width:0}
      .site-header .yh-more[open] .yh-more-menu{display:grid}
    }
  `;
  if(!document.getElementById(style.id))document.head.appendChild(style);
  if(!document.querySelector('link[data-yh-site-refresh]')){const refresh=document.createElement('link');refresh.rel='stylesheet';refresh.href='/site-refresh.css?v=1';refresh.dataset.yhSiteRefresh='true';document.head.appendChild(refresh)}
  if(path==='/'&&!document.querySelector('link[data-yh-home-immersive]')){const immersive=document.createElement('link');immersive.rel='stylesheet';immersive.href='/home-immersive.css?v=1';immersive.dataset.yhHomeImmersive='true';document.head.appendChild(immersive)}
  const nav=document.querySelector('#mainNav');const header=nav?.closest('.site-header')||nav?.parentElement;
  if(nav&&header){
    nav.innerHTML='';
    links.forEach(item=>{const a=document.createElement('a');a.href=item.href;a.textContent=item.label;if(item.key===active)a.setAttribute('aria-current','page');nav.appendChild(a)});
    const details=document.createElement('details');details.className='yh-more';
    const summary=document.createElement('summary');summary.textContent='More';summary.setAttribute('aria-label','More site links');
    const menu=document.createElement('div');menu.className='yh-more-menu';
    more.forEach(item=>{const a=document.createElement('a');a.href=item.href;a.textContent=item.label;if(item.key===active)a.setAttribute('aria-current','page');menu.appendChild(a)});
    details.append(summary,menu);nav.appendChild(details);
    const cta=document.createElement('a');cta.className='nav-cta';cta.href='/products.html';cta.textContent='Explore apps ↗';nav.appendChild(cta);
    const install=document.createElement('button');install.type='button';install.className='yh-install-app';install.id='yhInstallApp';install.textContent='Install app ↓';install.setAttribute('aria-label','Install YorpHives as an app');nav.appendChild(install);
    const oldToggle=header.querySelector('.menu-toggle');if(oldToggle)oldToggle.remove();
    let toggle=header.querySelector('.yh-menu-toggle');
    if(!toggle){toggle=document.createElement('button');toggle.className='yh-menu-toggle';toggle.type='button';toggle.setAttribute('aria-label','Open navigation');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';nav.before(toggle)}
    toggle.onclick=()=>{const open=nav.classList.toggle('yh-nav-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');toggle.textContent=open?'×':'☰'};
    nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('yh-nav-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');toggle.textContent='☰'}});
    document.addEventListener('click',e=>{if(!details.contains(e.target))details.open=false});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){details.open=false;nav.classList.remove('yh-nav-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');toggle.textContent='☰';toggle.focus()}});
  }
  document.querySelectorAll('footer.site-footer').forEach(footer=>{const box=footer.querySelector('.footer-links');if(!box)return;box.innerHTML=[['Home','/'],['Services','/services.html'],['Portfolio','/portfolio.html'],['Products','/products.html'],['Free Tools','/free-tools.html'],['Workbench','/workbench.html'],['QuickPanel','/quickpanel/'],['Extensions','/browser-extension.html'],['Plugins','/plugins.html'],['PDF & Images','/tools.html'],['File Conversion','/file-workspace.html'],['About','/#about'],['FAQ','/#faq'],['Start a project','/#request']].map(([label,href])=>'<a href="'+href+'">'+label+'</a>').join('')});
  if(path!=='/'&&!path.startsWith('/quickpanel')){
    const main=document.querySelector('main');const title=document.querySelector('main h1')?.textContent?.replace(/\s+/g,' ').trim()||document.title.split('|')[0].trim();
    if(main&&!document.querySelector('.yh-breadcrumb')){const section=document.createElement('nav');section.className='yh-breadcrumb';section.setAttribute('aria-label','Breadcrumb');const ol=document.createElement('ol');const home=document.createElement('li');home.innerHTML='<a href="/">Home</a>';ol.appendChild(home);const current=document.createElement('li');current.setAttribute('aria-current','page');current.textContent=path==='/services.html'?'Services':path==='/portfolio.html'?'Portfolio':path==='/products.html'?'Products':path==='/free-tools.html'?'Free Tools':path==='/workbench.html'?'Workbench':path==='/tools.html'?'PDF & Images':path==='/browser-extension.html'?'Extensions':title;ol.appendChild(current);section.appendChild(ol);main.before(section)}
  }
// A short purpose panel makes each destination self-explanatory, including pages with minimal introductory copy.
  const pageGuides={
    '/products.html':{title:'Original YorpHives products',description:'Explore tools and software built by YorpHives. Check what is available, how each product works, and whether it is free or has separate access terms.',tag:'PRODUCT LAB'},
    '/free-tools.html':{title:'Find a free tool for the task',description:'Search practical browser-based utilities by name or job. This directory is for free-to-use tools; choose a card to open the relevant tool and get to work.',tag:'FREE TOOL INDEX'},
    '/workbench.html':{title:'Your everyday browser workbench',description:'Use focused mini-tools for notes, text cleanup, research capture, data tasks and repeatable workflows in one workspace.',tag:'WORKSPACE'},
    '/tools.html':{title:'PDF and image toolkit',description:'Choose a task involving PDFs or images: convert, resize, merge, reorder, extract text, add watermarks or inspect files.',tag:'FILE UTILITIES'},
    '/file-workspace.html':{title:'Convert and organize files',description:'Pick a file task, open its control panel, choose your files and configure the output. Processing is designed to happen in your browser where supported.',tag:'CONVERSION BAY'},
    '/browser-extension.html':{title:'QuickPanel browser companion',description:'Learn what the YorpHives browser companion does, review supported browsers and installation options, and see its local-first features before installing.',tag:'BROWSER GEAR'},
    '/quickpanel':{title:'QuickPanel — quick actions, right where you work',description:'Open handy text actions, saved snippets and page utilities from a compact browser-friendly workspace.',tag:'QUICK ACCESS'}
  };
  const guide=pageGuides[path]||(path.endsWith('.html')?{title:(document.querySelector('main h1')?.textContent||document.title.split('|')[0]||'YorpHives tool').replace(/\\s+/g,' ').trim(),description:document.querySelector('meta[name="description"]')?.content||'Use this YorpHives page to complete the task described by its title. Check the available controls and follow the on-page guidance.',tag:path==='/plugins.html'?'PLUGIN WORKSHOP':path==='/offline.html'?'OFFLINE GUIDE':'TOOL INTERFACE'}:null);
  if(guide&&!document.querySelector('.yh-page-guide')){
    const main=document.querySelector('main')||document.querySelector('#app')||document.body;
    const box=document.createElement('section');box.className='yh-page-guide';box.setAttribute('aria-label','What this page is for');
    const inner=document.createElement('div');inner.className='yh-page-guide-inner';
    const copy=document.createElement('div');copy.className='yh-page-guide-copy';
    const label=document.createElement('span');label.className='yh-page-guide-label';label.textContent='SYSTEM GUIDE / PAGE PURPOSE';
    const heading=document.createElement('h2');heading.textContent=guide.title;
    const description=document.createElement('p');description.textContent=guide.description;
    copy.append(label,heading,description);
    const tag=document.createElement('span');tag.className='yh-page-guide-tag';tag.textContent=guide.tag;
    inner.append(copy,tag);box.append(inner);
    const breadcrumb=document.querySelector('.yh-breadcrumb');
    if(breadcrumb&&breadcrumb.parentElement)breadcrumb.insertAdjacentElement('afterend',box);else main.insertBefore(box,main.firstChild);
  }
  // Progressive Web App setup: manifest, service worker, and install prompt.
  if(!document.querySelector('link[rel="manifest"]')){const manifest=document.createElement('link');manifest.rel='manifest';manifest.href='/manifest.webmanifest';document.head.appendChild(manifest)}
  if(!document.querySelector('meta[name="theme-color"]')){const theme=document.createElement('meta');theme.name='theme-color';theme.content='#08090e';document.head.appendChild(theme)}
  const installButton=document.getElementById('yhInstallApp');
  let deferredInstallPrompt=null;
  const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.matchMedia('(display-mode: minimal-ui)').matches||window.navigator.standalone===true;
  const showInstall=()=>{if(installButton){installButton.classList.add('yh-install-visible');installButton.textContent='Install app ↓'}};
  const hideInstall=()=>installButton?.classList.remove('yh-install-visible');
  if(isStandalone()){hideInstall()}else{showInstall()}
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;showInstall()});
  window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;hideInstall();showPwaHint('YorpHives is installed. Open it from your desktop, app launcher, or home screen.')});
  function showPwaHint(message){
    const old=document.querySelector('.yh-pwa-hint');if(old)old.remove();
    const hint=document.createElement('div');hint.className='yh-pwa-hint';hint.setAttribute('role','status');hint.setAttribute('aria-live','polite');hint.textContent=message;document.body.appendChild(hint);
    window.setTimeout(()=>{if(hint.isConnected)hint.remove()},12000);
  }
  installButton?.addEventListener('click',async()=>{
    const nav=document.querySelector('#mainNav');const toggle=document.querySelector('.yh-menu-toggle');
    if(nav?.classList.contains('yh-nav-open')){nav.classList.remove('yh-nav-open');toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Open navigation');if(toggle)toggle.textContent='☰'}
    if(isStandalone()){hideInstall();showPwaHint('YorpHives is already running as an installed app.');return}
    if(deferredInstallPrompt){
      try{
        deferredInstallPrompt.prompt();
        const choice=await deferredInstallPrompt.userChoice;
        deferredInstallPrompt=null;
        if(choice?.outcome==='accepted'){hideInstall();showPwaHint('Installation accepted. Follow any browser or operating-system confirmation to finish.')}
        else{showInstall();showPwaHint('Installation was cancelled. You can try again later, or use your browser menu to install YorpHives.')}
      }catch(error){deferredInstallPrompt=null;showInstall();showPwaHint('The browser could not open its install prompt. Use the browser menu to look for “Install YorpHives” or “Install app”.')}
      return;
    }
    const ua=navigator.userAgent;
    if(/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)){
      showPwaHint('Add YorpHives to your Home Screen: open this site in Safari, tap Share, choose “Add to Home Screen”, then tap Add. If the option is missing, scroll through the Share actions or check Safari’s Add to Home Screen options.');
      return;
    }
    if(/Android/i.test(ua)){
      showPwaHint('To install on Android: open YorpHives in Chrome or another supported browser, open the browser menu, choose “Install app” or “Add to Home screen”, and confirm. If no option appears, update the browser, reload this page, and try outside private browsing.');
      return;
    }
    showPwaHint('To install on desktop: in Chrome or Edge, open the browser menu or look for the install icon in the address bar, then choose “Install YorpHives” or “Install app”. If it is unavailable, update the browser, reload this HTTPS page, and check the browser’s PWA/installability diagnostics. Some browsers do not support native PWA installation.');
  });
  if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js',{scope:'/'}).catch(error=>console.warn('YorpHives offline support could not be registered.',error)))}
})();