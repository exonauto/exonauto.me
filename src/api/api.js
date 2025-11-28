import express from 'express';
import { authentication, blogs, saveBlogs, generateImage } from '../utils/utils.js';

const api = express.Router()

api.get('/me', (req, res) => {
  res.json({
    authed:!!req.session.authed
  });
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