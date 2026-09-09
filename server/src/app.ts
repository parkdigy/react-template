import './init';

import express from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import ejs from 'ejs';
import path from 'path';
import { exec } from 'child_process';
import nocache from 'nocache';
import axios from 'axios';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { HttpAgent } from 'agentkeepalive';
import { createProxyMiddleware, Options as CreateProxyMiddlewareOptions } from 'http-proxy-middleware';
import { ContentSecurityPolicy, CsrfErrorHandler } from './middlewares';
import { Version, Deploy } from './controllers';
import scheduler from './scheduler';

const isSecure = process.env.APP_SECURE === 'true';
const keepaliveAgent = new HttpAgent({
  timeout: Number(process.env.API_KEEP_ALIVE_TIMEOUT_SECONDS) * 1000,
  freeSocketTimeout: (Number(process.env.API_KEEP_ALIVE_TIMEOUT_SECONDS) + 1) * 1000,
});

const app = express();

app.disable('x-powered-by');

let isDisableKeepAlive = false;

app.use(function (req, res, next) {
  if (isDisableKeepAlive) {
    res.set('Connection', 'close');
  }
  next();
});

process.on('SIGINT', () => {
  ll('!!! process.on', 'SIGINT');

  isDisableKeepAlive = true;

  let serverCount = servers.length;
  for (const server of servers) {
    server.close(() => {
      serverCount -= 1;
      if (serverCount === 0) {
        process.exit(0);
      }
    });
  }
});

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', getClientPath());

if (process.env.APP_ENV === 'local') {
  app.use(nocache());
}
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cookieParser());
app.use(ContentSecurityPolicy);

if (
  process.env.SESSION_DRIVER === 'redis' &&
  process.env.APP_KEY &&
  process.env.PROJECT_NAME &&
  process.env.SESSION_REDIS_HOST &&
  process.env.SESSION_REDIS_PORT
) {
  const redisClient = createClient({
    socket: {
      host: process.env.SESSION_REDIS_HOST,
      port: Number(process.env.SESSION_REDIS_PORT),
    },
    password: process.env.SESSION_REDIS_PASSWORD,
  });
  redisClient.connect().catch(console.error);

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: `${process.env.PROJECT_NAME.toLowerCase().replace(/-/g, '_')}:`,
  });

  app.use(
    session({
      store: redisStore,
      resave: false,
      saveUninitialized: false,
      secret: process.env.APP_KEY,
    })
  );
}

/** version */
let realVersion = Version;
app.get('/api/version/app', function (req, res) {
  realVersion.app(req, res);
});
app.get(/^\/api\/.*\/version\/app$/, function (req, res) {
  realVersion.app(req, res);
});

/** apple-app-site-association */
const appleAppSiteAssociationPath = '/apple-app-site-association';
const appleAppSiteAssociation = fs.existsSync(`${getClientPath()}${appleAppSiteAssociationPath}`)
  ? fs.readFileSync(`${getClientPath()}${appleAppSiteAssociationPath}`)
  : undefined;
app.get(appleAppSiteAssociationPath, function (req, res) {
  if (appleAppSiteAssociation) {
    res.set('Content-Type', 'application/json');
    res.status(200).send(appleAppSiteAssociation);
  } else {
    res.status(404).end();
  }
});

/** .well-known/apple-app-site-association */
app.get(`/.well-known${appleAppSiteAssociationPath}`, function (req, res) {
  if (appleAppSiteAssociation) {
    res.set('Content-Type', 'application/json');
    res.status(200).send(appleAppSiteAssociation);
  } else {
    res.status(404).end();
  }
});

if (process.env.API_URL) {
  const proxyOptions: CreateProxyMiddlewareOptions = {
    target: process.env.API_URL,
    changeOrigin: true,
    xfwd: true,
    pathRewrite: { '^/api': '/' },
  };
  if (process.env.API_KEEP_ALIVE === 'true') {
    proxyOptions.agent = keepaliveAgent;
  }

  app.use('/api', createProxyMiddleware(proxyOptions));
  app.use('/api', CsrfErrorHandler);
}

app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

let realDeploy = Deploy;
app.post('/deploy/github', function (req, res) {
  realDeploy.github(req, res);
});

app.use(
  express.static(getClientPath(), {
    index: false,
  })
);

+app.get(/./, (req, res) => {
  res.render('index', {
    title: process.env.APP_NAME,
    appEnv: process.env.APP_ENV,
  });
});

function startServer() {
  const handleListen = () => {
    scheduler.$start();

    if (typeof process.send === 'function') {
      process.send('ready');
    }

    ll(`Listening : ${isSecure ? 443 : process.env.APP_PORT}`);

    // 슬랙에 서버 실행 메시지 발송
    if (process.env.APP_ENV !== 'local' && notEmpty(process.env.SLACK_WEB_HOOK_URL)) {
      exec('git remote -v', (err, stdout, stderr) => {
        if (!err || notEmpty(stderr)) {
          if (process.env.SLACK_WEB_HOOK_URL) {
            const appName = path.basename(stdout.split('\n')[0].split('\t')[1].split(' ')[0], '.git');
            axios.post(
              process.env.SLACK_WEB_HOOK_URL,
              {
                blocks: [
                  {
                    type: 'section',
                    text: {
                      type: 'plain_text',
                      text: `:rocket: ${appName} (${process.env.APP_ENV})  서버가 실행되었습니다. :rocket:`,
                    },
                  },
                  {
                    type: 'divider',
                  },
                ],
              },
              {
                timeout: 1000 * 60,
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
              }
            );
          }
        }
      });
    }
  };

  const servers = [];

  if (isSecure) {
    if (!process.env.APP_SECURE_KEY_PATH || !process.env.APP_SECURE_CERT_PATH || !process.env.APP_SECURE_CA_PATH) {
      throw new Error(
        '.env 에 APP_SECURE 가 true 인 경우, APP_SECURE_KEY_PATH, APP_SECURE_CERT_PATH, APP_SECURE_CA_PATH 반드시 입력해야 합니다.'
      );
    } else {
      servers.push(
        https
          .createServer(
            {
              key: fs.readFileSync(process.env.APP_SECURE_KEY_PATH),
              cert: fs.readFileSync(process.env.APP_SECURE_CERT_PATH),
              ca: fs.readFileSync(process.env.APP_SECURE_CA_PATH),
            },
            app
          )
          .listen(process.env.APP_SECURE_PORT || 443, handleListen)
      );

      servers.push(
        http
          .createServer(function (req, res) {
            res.writeHead(301, {
              Location: `https://${req.headers['host']}${req.url}`,
            });
            res.end();
          })
          .listen(process.env.APP_PORT)
      );
    }
  } else {
    servers.push(http.createServer(app).listen(process.env.APP_PORT, handleListen));
  }

  if (process.env.APP_KEEP_ALIVE === 'true') {
    for (const server of servers) {
      server.keepAliveTimeout = Number(process.env.APP_KEEP_ALIVE_TIMEOUT_SECONDS) * 1000;
      server.headersTimeout = (Number(process.env.APP_KEEP_ALIVE_TIMEOUT_SECONDS) + 1) * 1000;
    }
  }

  return servers;
}

let servers = startServer();

if (module.hot) {
  module.hot.accept(['./init']);

  module.hot.accept('./controllers', () => {
    import('./controllers').then(({ Version, Deploy }) => {
      realVersion = Version;
      realDeploy = Deploy;
    });

    for (const server of servers) {
      server.close();
    }
    servers = startServer();
  });
}
