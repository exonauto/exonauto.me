import { editor, KeyCode } from 'monaco-editor/esm/vs/editor/editor.api';

let editorInstance = editor.create(document.getElementById('editor'), {
    value: "<!-- \n Default Title \n Default ID \n Default Headline \n -->\n<h3>A title!</h3>\n<hr>\n<p>Some content!</p>",
    language: "html",
    theme: 'vs-dark'
});

var myBinding = editorInstance.addCommand(KeyCode.F8, function () {
    // todo, visual feedback for when you actually preview the blogs
    const value = editorInstance.getValue();
    on(value);
});

var myBinding = editorInstance.addCommand(KeyCode.F9, function () {
    // todo, visual feedback for when you actually send the blogs
    // add tags to blogs?

    const value = editorInstance.getValue();
    const split = value.split('\n');
    
    split.shift()

    const title = split.shift().trim();
    const id = split.shift().trim();
    const headline = split.shift().trim();
    
    split.shift()

    const content = split.join('\n');

    console.log( title, id, headline, content );
    postBlog(title, id, headline, content);
});

// Resize the editor when the window size changes
const editorElement = document.getElementById("editor");

window.addEventListener("resize", () => editorInstance.layout({
      width: editorElement.offsetWidth,
      height: editorElement.offsetHeight
}));
  
window.editBlog = async function (json, blogKey) {
    const {key, headline, title, content} = json;
    editorInstance.getModel().setValue(`<!-- \n ${title} \n ${blogKey} \n ${headline} \n -->\n ${content}`);
}

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

async function fetchBlogs(){
    const response = await fetch('/api/blogs');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const blogs = await response.json();
    return blogs;
}

document.getElementById('overlayWrap').onclick = () => {
    off();
}

async function listBlogs(){
    let blogs = await fetchBlogs();
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

function createElm(tag, text){
    return (() => { const el = document.createElement(tag); if (text) el.innerText = text; return el; })();
}

listBlogs();