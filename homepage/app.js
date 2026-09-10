(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#mobile-nav');
  const header = document.querySelector('#site-header');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    nav.hidden = !open;
    header.classList.toggle('menu-open', open);
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    setMenu(false);
    if (link.hash && link.origin === location.origin) {
      const target = document.getElementById(link.hash.slice(1));
      if (target) { target.tabIndex = -1; target.focus({preventScroll: true}); }
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !nav.hidden) { setMenu(false); toggle.focus(); }
  });
  const wideScreen = matchMedia('(min-width: 801px)');
  wideScreen.addEventListener('change', event => { if (event.matches) setMenu(false); });
})();
