// vite.config.js
import { defineConfig } from 'vite';
import { ViteMinifyPlugin } from "vite-plugin-minify";

import fs from 'fs/promises';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function listDirectories(dirPath) {
  let entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries.filter(entry => entry.isDirectory());
}

export default defineConfig(async () => {
  let folders = {};
  let dirs = await listDirectories(path.resolve('./app/pages'));

  for (let dir of dirs) {
    folders[dir.name] = `/pages/${dir.name}/index.html`;
  }
  
  console.log("folders: ", folders);

  return {
    root: "./app/",
    plugins: [ViteMinifyPlugin()],
    build: {
      outDir: "dist",
      manifest: true,
      rollupOptions: {
        input: {
          main: '/index.html',
          blogTemplate: '/pages/blog/template.html',
          blogImageTemplate: '/pages/blog/templateImage.html',
          ...folders
        }
      }
    }
  };
});