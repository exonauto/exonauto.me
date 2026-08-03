async function fetchJson(url){
    const json  = await (await fetch(url)).json();
    return json;
}

let prefix = '';
async function init(){
    if (import.meta.env.DEV){
        prefix = ''
    } else {
        prefix = 'https://exonauto.me'
    }
    const blogs = await fetchJson(prefix+'/api/blogs');

    const elm = document.getElementById('blogs-mini');
    for (let blog of Object.values(blogs).reverse()){
        if (typeof blog === "number") continue;
        console.log(blog)
        const span = document.createElement('span');
        let previewText = ""
        if (blog.title.length > 20) {
            previewText = blog.title.substring(0,17) + "..."
        } else {
            previewText = blog.title;
        }

        console.log(previewText)
        span.innerText = previewText + " "
        
        const a = document.createElement('a')
        a.innerText = "link"
        a.href = 'https://exonauto.me/blog/'+blog.key
        
        span.appendChild(a);
        elm.appendChild(span)
    }
    
    const views = await fetchJson(prefix+'/api/views');
    console.log(views)
    document.getElementById('header').innerText = "ExonAuto.me - "+views.views+" views"
}

init();