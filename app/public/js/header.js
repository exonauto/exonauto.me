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

function initImgHover(){
  let imgList = document.getElementsByClassName('myProfileImg');
  let img = imgList[0];
  if (!img) return;

  img.addEventListener('mouseover', function() {
    this.src = '/images/favicon.gif';
  });

  img.addEventListener('mouseleave', function(){
    this.src = '/images/favicon.png'
  })
}

init();
initImgHover();