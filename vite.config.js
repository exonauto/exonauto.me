// vite.config.js
import { defineConfig } from 'vite';
import { ViteMinifyPlugin } from "vite-plugin-minify";

export default defineConfig({
  root: "./app/",
  plugins: [
      ViteMinifyPlugin(),
  ],
  
  build: {
    rollupOptions: {
      manifest: true,
      input: {
        'main': '/index.html',
        'blog': '/pages/blog/index.html',
        'blogTemplate': '/pages/blog/template.html',
        'blogImageTemplate': '/pages/blog/templateImage.html',
        'echo': '/pages/echo/index.html',
        'login': '/pages/login/index.html',
        'panel': '/pages/panel/index.html'
      },
      outDir: '/dist',
    },
  },
});
