import { defineConfig } from 'vite';
import { resolve } from 'path';

const rootRewritePlugin = {
  name: 'root-rewrite-to-html-pages',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/' || req.url === '/index.html') {
        req.url = '/html/index.html';
      } else if (req.url === '/cv' || req.url === '/cv.html') {
        req.url = '/html/cv.html';
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [rootRewritePlugin],
  server: {
    open: '/', // clean root in browser
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'html/index.html'),
        cv: resolve(__dirname, 'html/cv.html'),
      },
    },
  },
  preview: {
    open: true,
  },
});
