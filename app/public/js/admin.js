let base = null;

fetch('/pages/blog/template.html')
  .then(response => {
    // When the page is loaded convert it to text
    return response.text()
  })
  .then(html => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    base = doc;
    console.log(doc)
  })
  .catch(error => {
     console.error('Failed to fetch page: ', error)
})

function on(title, id, headline, content) {
    const wrap = document.getElementById('overlayWrap');
    const frame = document.getElementById('overlay');
    let preview = base.documentElement.outerHTML;
    preview = preview
    .replaceAll('{{title}}', title)
    .replaceAll('{{headline}}', headline)
    .replaceAll('{{content}}', content);

    wrap.style.display = 'flex';
    frame.srcdoc = preview;
}
  
function off() {
    document.getElementById('overlayWrap').style.display = 'none';
    document.getElementById('overlay').srcdoc = "";
}

off();