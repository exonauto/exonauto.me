import express from 'express';
import { authentication, blogs, saveBlogs, generateImage } from '../utils/utils.js';

const api = express.Router()

const pages = [
  { name: 'home', path: '/' },
  { name: 'blog', path: '/blog' },
  { name: 'soon', path: 'https://sketchyfile.download?refer=exonauto.me'}
];

api.get('/headers', (req, res) => {
  let curr = req.query.currPage || '';
  curr = curr.substring(1,curr.length)
  let html = '';

  for (const page of pages) {
    if (curr.startsWith(page.name)) continue;
    html += `<a style="text-decoration:underline" href="${page.path}">${page.name}</a>`;
  }

  if (req.session.authed) {
    html += `<a style="text-decoration:underline" href="/admin">admin</a>`;
  }

  res.send(html);
});

api.use(authentication)

api.get('/blogs', (req, res) => {
  res.json(blogs)
})

api.post('/blog/post', (req, res) => {
  const blogInfo = req.body;
  const {title, key, headline, content} = blogInfo;
  if (!title || !headline || !key || !content) return res.status(400).json( { error:"malformed content :(" } )
  
  try { 
    blogs[ key ] = blogInfo;
    generateImage(key);
    saveBlogs();
    
    res.send({
      message: blogInfo,
    });

  } catch (error) {
    console.warn(error);
    res.status(500).json( { "error":"whoops! internal server error!" } )
  }
})

export default api;