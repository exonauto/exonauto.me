const pageMap = [
  { name: 'home', path: '/' },
  { name: 'blog', path: '/blog' },
  { name: 'sketch', path: '/sketch' },
  { name: 'admin', path: '/admin', authed: true }
];

async function init() {
  const me = await (await fetch('/api/me')).json();
  const authed = me.authed;

  const nav = document.querySelector("nav");
  const currName = window.location.pathname.substring(1) || "home";

  for (const page of pageMap) {
    if (page.authed && !authed) continue;

    if (currName.startsWith(page.name)) continue;
    
    const a = document.createElement("a");
    a.textContent = page.name;
    a.href = page.path;
    a.style.textDecoration = "underline";
    a.style.marginRight = "10px";

    nav.appendChild(a);
  }
}

init();
