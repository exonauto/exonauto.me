let curr = window.location.pathname == '/' ? '/home' : window.location.pathname;

fetch(`/api/headers?currPage=${curr}`)
  .then(response => response.text())
  .then(html => {
    document.querySelector("nav").innerHTML += html;
  })
  .catch(console.error);
