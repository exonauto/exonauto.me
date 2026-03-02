const pageMap = [
  { name: 'home', path: '/' },
  { name: 'blog', path: '/blog' },
  { name: 'verify', path: '/verify' },
  { name: 'admin', path: '/admin', authed: true }
];

async function init() {
  const cookie = await cookieStore.get('authed');
  const nav = document.querySelector("nav");
  const currName = window.location.pathname.substring(1) || "home";

  for (const page of pageMap) {
    if (page.authed && !cookie) continue;

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
