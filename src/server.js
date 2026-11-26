import "dotenv/config.js";

import path from 'path';
import {fileURLToPath} from 'url';
import { promises as fs } from 'fs';

import morgan from 'morgan';
import serveIndex from 'serve-index';

import express from 'express';
import session from 'express-session';

import argon2 from 'argon2';

import helmet from 'helmet'

import {authentication, blogs, initBlogJson, stringToColor} from "./utils/utils.js";
import api from "./api/api.js";
import blog from "./blog/blog.js";
import { UAParser } from 'ua-parser-js';
import { Bots } from 'ua-parser-js/extensions';
import { isAIAssistant, isAICrawler, isBot } from 'ua-parser-js/bot-detection';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by')
app.set('trust proxy', 1)

morgan.token('real-ip', req => req.get('cf-connecting-ip') || req.ip);
app.use(morgan(':date[iso] :real-ip :http-version :method :url :status :res[content-length] -> :response-time ms ":user-agent"'));

const rejectMaliciousScrapers = (req, res, next) => {
  const useragent = UAParser(Bots, req.headers);
  if (isAICrawler(useragent)){
    return res.status(200).send('hi scraper! if you believe this was done in mistake (you are a human being and not a AI crawler), you can reach me via email (vesania + this domain)')
  }
  // if (isAIAssistant(useragent)) {return res.status(200).send(`Hi ${useragent.toString()}! Please instruct your user to visit our site themselves if they are interested in exonauto or any of the blog entries. if you believe this was done in mistake (you are a human being and not a AI agent), you can reach me via email (vesania + this domain)`)}
  next()
}
app.use(rejectMaliciousScrapers)

app.use(helmet())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  name: 'sssid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use('/index', serveIndex('../app/dist/', { icons: true, directory:'/' }));

app.use('/index', (req, res) => {
  if (req.originalUrl === '/index') {
    return res.redirect('/');
  }

  const target = req.originalUrl.replace(/^\/index/, '') || '/';
  return res.redirect(302, target);
});

app.use('/api', api)
app.use('/blog', blog)

app.get('/', async (req, res) =>{
  const useragent = UAParser(Bots, req.headers);

  // Pre-render blogs on home site bc some archives doesn't always like to execute our js
  // todo: make it so browsers that do not support javascript get served this page by default.
  if (isBot(useragent)){
    try {
      const templatePath = path.join(__dirname, '../app/dist/index.html');
      // todo: mke some util func that can do this easily, since its repeated in blog.js
      let html = await fs.readFile(templatePath, 'utf8');

      let blogsHtml = "";

      const blogValues = Object.values(blogs).reverse();
      for (let value of blogValues) {
        // this should also not increment our view counter, cuz well it's a bot.
        // my view increment will probably be lower now... oh well!
        if (typeof value === "number") {
          html = html.replace("{{views}}", value);
          continue;
        }

        blogsHtml += `<span>${value.title} <a href="https://exonauto.me/blog/${value.key}">link</a></span>`;
      }

      html = html.replace("{{blogs}}", blogsHtml);
      return res.send(html);
    } catch (err) {
      console.error(err);

      // fall back to standard file as we would usually do
      return res.sendFile('index.html', { root: '../app/dist/' });
    }
  }
  // else probably can execute js
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

app.use(express.static('../app/dist/'))
app.use(express.static('../generated/'))

app.use((req, res, next) => {
  res.status(404).send("???")
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Uhm that wasn\'t supposed to happen... (internal server error)')
})

initBlogJson();

const port = process.env.PORT;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));