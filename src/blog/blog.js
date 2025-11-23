import express from 'express';
import { blogs } from '../utils/utils.js';

import path from 'path';
import {fileURLToPath} from 'url';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blog = express.Router()

// to do - store cache of html, dynamically update when new blog post?
blog.get('/', async (req, res) => {
    try {
        const templatePath = path.join(__dirname, '../../app/dist/pages/blog/index.html');
        let html = await fs.readFile(templatePath, 'utf8');
    
        let blogsHtml = "";
        const blogIDs = Object.keys(blogs).reverse(); 
    
        for (let blogID in blogIDs) {
          blogID = blogIDs[blogID]
    
          const blog = blogs[blogID]
          blogsHtml += `
            <div id="${blogID}" class="blogSelection">
              <a href="/blog/${blogID}" style="cursor:pointer">${blog.title}</a>
              <hr>
              <p>${blog.headline}</p>
            </div>
          `;
        }
    
        html = html.replace("{{blogs}}", blogsHtml);
    
        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error when rendering blog :(");
    }
})

blog.get('/:id', async (req, res) => {
    const blog = blogs[req.params.id];
    if (!blog) return res.status(404).send('Not found... Whoops?');
  
    try {
      const templatePath = path.join(__dirname, '../../app/dist/pages/blog/template.html');
      let template = await fs.readFile(templatePath, 'utf8');
  
      template = template
        .replaceAll('{{image}}', req.params.id)
        .replaceAll('{{title}}', blog.title)
        .replaceAll('{{headline}}', blog.headline)
        .replaceAll('{{content}}', blog.content);
  
      res.send(template);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }  
})

export default blog;