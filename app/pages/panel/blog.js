import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header'; 
import List from '@editorjs/list'; 
import SimpleImage from "@editorjs/simple-image";
import Quote from "@editorjs/simple-image";
import CodeTool from "@editorjs/code";
import Embed from '@editorjs/embed';
import edjsHTML from 'editorjs-html'
  
async function postBlog(title, key, headline, content) {
    const rawResponse = await fetch('/api/blog/post', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify( { title, key, headline, content } )
    });

    const res = await rawResponse.json();
    console.log(res);
}

async function deleteBlog(key) {
    const rawResponse = await fetch('/api/blog/'+key, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    const res = await rawResponse.json();
    console.log(res);
}


async function fetchApiRes(api){
    const response = await fetch('/api/'+api);
    if (!response.ok) throw new Error('Network response was not ok');
    const blogs = await response.json();
    return blogs;
}

async function listImages(){
    let images = await fetchApiRes('images');
    let holder = document.getElementById('images');
    holder.innerHTML = "";
    
    for (let imageKey in images) {
        let image = images[imageKey];
        console.log(image);

        let imageHolder = createElm('div');
        imageHolder.id = imageKey;
        imageHolder.classList = "blogSelection"

        const img = document.createElement("img");
        img.src = "/images/"+image.name;

        const d = createElm('details');
        const summary = createElm('summary', image.name.split('.'))
        d.appendChild(summary)
        d.appendChild(img)
        
        // imageHolder.appendChild(img);
        imageHolder.appendChild(d);
        holder.prepend(imageHolder);
    }
}
async function listBlogs(){
    let blogs = await fetchApiRes('blogs');
    let holder = document.getElementById('blogs');

    holder.innerHTML = "";
    
    for (let blogKey in blogs) {
        let blog = blogs[blogKey];
        console.log(blog);

        let blogHolder = createElm('div');
        blogHolder.id = blogKey;
        blogHolder.classList = "blogSelection"

        const h1 = document.createElement("a");
        h1.textContent = blog.title;
        h1.style.cursor = "pointer";
        
        h1.addEventListener("click", () => {
            editBlog(blog, blogKey);
        });

        blogHolder.appendChild(h1);
        
        let hr = createElm('hr');
        blogHolder.appendChild(hr);
        
        let p = createElm('p', blog.headline);
        blogHolder.appendChild(p);

        holder.prepend(blogHolder);
    }

}

listBlogs();
listImages();

const editor = new EditorJS({
    holder: "editor",
    tools: {
        header: {
            class: Header,
            defaultLevel: 3
        },
        list: List,
        simpleImage: SimpleImage,
        // quote: Quote,
        code: CodeTool,
        
        // embed: {
        //     class: Embed,
        //     inlineToolbar: true
        // }
    }
});

await editor.isReady;

async function editBlog(json, blogKey) {
    const {headline, title, content} = json;
    console.log(key, blogKey)
    document.getElementById('title').value = title
    document.getElementById('headline').value = headline
    document.getElementById('key').value = blogKey
    await editor.isReady;
    await editor.blocks.renderFromHTML(content);
}

async function scaffoldDelete() {
    const {id} = await getValues(true);
    deleteBlog(id);
}

async function scaffoldPost() {
    const {title, id, headline, html} = await getValues();
    await postBlog(title, id, headline, html);
}

async function scaffoldPreview(){
    console.log('hi')
    const {title, id, headline, html} = await getValues();
    on(title, id, headline, html);
}

async function getValues(justHtml){
    const title = document.getElementById('title').value;
    const id = document.getElementById('key').value;
    const headline = document.getElementById('headline').value;
    if (justHtml) return {title, id, headline};
    
    await editor.isReady;
    const data = await editor.save();
    const parser = edjsHTML(plugins);
    const html = parser.parse(data);
    
    return {title, id, headline, html}
}

document.getElementById('post').onclick = scaffoldPost;

document.getElementById('preview').onclick = scaffoldPreview;

document.getElementById('delete').onclick = scaffoldDelete;

document.getElementById('overlayWrap').onclick = () => {
    off();
}

const plugins = {
    // The keyname must match with the type of block you want to parse with this funcion
    simpleImage: customParser,
};

// @todo implement withBackground & withBorder as well as stretched...?
function customParser(block) {
    return `<div><img src="${block.data.url}" alt="${block.data.caption}"></img></div>`;
}

function createElm(tag, text){
    return (() => { const el = document.createElement(tag); if (text) el.innerText = text; return el; })();
}