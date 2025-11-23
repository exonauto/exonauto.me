import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import path from 'path';

import satori from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";

export let blogs = {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = '../blogs.json';

export const authentication = (req, res, next) => {
    if (!req.session.authed) {
      return res.status(401).redirect('/');
    }
    
    next();
}

export async function initBlogJson() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    blogs = JSON.parse(data);

    return blogs;
  } catch (err) {
    console.error("Error reading blogs:", err);
    return {};
  }
}

export async function saveBlogs() {
  try {
    const json = JSON.stringify(blogs);
    const tempFilePath = `${filePath}.tmp_${Date.now()}`;
    
    await fs.writeFile(tempFilePath, json, 'utf8');
    await fs.rename(tempFilePath, filePath);
  } catch (err) {
    console.error('Error writing file:', err);
  }
}

export async function generateImage(key){
  const templatePath = path.join(__dirname, '../../app/dist/pages/blog/templateImage.html');

  console.log(blogs)
  let blog = blogs[key]
  console.log(blog)

  let template = await fs.readFile(templatePath, 'utf8');

  template = template
    .replaceAll('{{image}}', key)
    .replaceAll('{{title}}', blog.title)
    .replaceAll('{{headline}}', blog.headline)
    .replaceAll('{{content}}', blog.content);

  const markup = html(template);

  const fontData = await fs.readFile(
    "../VictorMono-Regular.ttf"
  );
  
  const svg = await satori(markup, {
    width: 1200,
    height: 628,
    fonts: [
      {
        name: "Arial",
        data: fontData,
        weight: "auto",
        style: "normal",
      },
    ],

  });

  
  const resvg = new Resvg(svg, {
    background: "rgba(255, 255, 255, 1)",
  });
  
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFile("../generated/blogs" + key + ".png", pngBuffer)
}


export const stringToColor = (str) => {
  let hash = 0;
  str.split('').forEach(char => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  })
  let colour = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    colour += value.toString(16).padStart(2, '0')
  }
  return colour
}