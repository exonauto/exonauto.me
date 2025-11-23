import "dotenv/config.js";

import path from 'path';
import {fileURLToPath} from 'url';
import { promises as fs } from 'fs';

import chalk from 'chalk';
import serveIndex from 'serve-index';

import express from 'express';
import session from 'express-session';

import argon2 from 'argon2';

import { authentication, initBlogJson, stringToColor } from "./utils/utils.js";
import api from "./api/api.js";
import blog from "./blog/blog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(express.static('../app/dist/'))
app.use(express.static('../generated/'))

app.use('/index', serveIndex('../app/dist/', { icons: true, directory:'/' }));

app.use('/index/*', (req, res) => {
  if (req.originalUrl == "/index") return res.status(200).res.redirect('/index');

  const target = req.originalUrl.replace(/^\/index/, '') || '/index';
  return res.redirect(302, target);
});

const log = (req, res, next) => {
  let d = new Date();
  const hex = chalk.hex(stringToColor(req.originalUrl));
  console.log(hex(`req ${req.method} ${req.originalUrl} by ${req.headers['cf-connecting-ip'] ? req.headers['cf-connecting-ip'] : req.ip} @ ${d.toLocaleString()}`))
  next()
}

app.use(log)

app.use('/api', api)
app.use('/blog', blog)

app.get('/', (req, res) =>{
  console.log(req)
  return res.sendFile('index.html', { root: '../app/dist/' });
})

app.get('/admin', authentication, (req, res
  ) => {
  return res.sendFile('index.html', { root: '../app/dist/pages/panel/' });
})

app.get('/pulse', (req, res
  ) => {
  return res.sendFile('index.html', { root: '../app/dist/pages/echo/' });
})

app.get('/verify', async (req, res) => {
  if (!req.session.authed) return res.sendFile('index.html', { root: '../app/dist/pages/login/' });
  return res.redirect('/admin');
})

app.post('/verify', async (req, res) => {
  let password = req.body.password;
  if (!password) return res.sendFile('index.html', { root: '../app/dist/pages/login/' });
  
  let verified = await argon2.verify(process.env.HASH, password);
  
  if (verified) {
    req.session.authed = true;
  }

  return res.status(verified ? 200: 401).redirect('/admin');
})

initBlogJson();

const port = process.env.PORT;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));