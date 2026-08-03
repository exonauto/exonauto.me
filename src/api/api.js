import express from 'express';

import { authentication, blogs, saveBlogs, generateImage } from '../utils/utils.js';

import fs from 'fs/promises';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function listImages() {
  let dirPath = await path.resolve('../app/dist/images');
  let entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries.filter(entry => !entry.isDirectory());
}

let saveTimeout = 0;
function scheduleSave() {
  if (saveTimeout) return;

  saveTimeout = setTimeout(() => {
    saveBlogs();
    saveTimeout = null;
  }, 5000);
}

const api = express.Router()

api.get('/me', (req, res) => {
  res.json({
    authed:!!req.session.authed
  });
});

api.get('/blogs', (req, res) => {
  res.json(blogs);
})

api.get('/neo/blogs.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.blogs = ${JSON.stringify(blogs)};`);
});

const recentViews = new Map();

api.get('/views', (req, res) => {
  const ip = req.ip;
  const now = Date.now();

  const lastView = recentViews.get(ip);

  if (!lastView || now - lastView > 60 * 60 * 1000) {
    blogs.totalViews = (blogs.totalViews ?? 0) + 1;
    recentViews.set(ip, now);

    scheduleSave();
  }

  res.json({'views': blogs.totalViews});
});

api.get('/neo/views.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.views = ${blogs.totalViews};`);
})

api.use(authentication)

api.get('/images',  async (req, res) => {
  res.json( await listImages());
});

api.delete('/blog/:id', (req, res) => {
  try {
    delete blogs[req.params.id];
    
    res.send({
      blogs
    });

    saveBlogs();
  }catch (error) {
    console.warn('Err when deleting blog w/ id: '+req.params.id, error);
    res.status(500).json( { "error":"Err when deleting id check logs!" } )
  }
});

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