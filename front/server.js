const express = require("express");
const next = require("next");
const SocketServer = require('ws').Server;
const nextI18NextMiddleware = require("next-i18next/middleware").default;

const nextI18next = require("./plugins/i18n");

const port = process.env.PORT || 3000;
const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

(async () => {
  await app.prepare();
  const server = express();

  await nextI18next.initPromise;
  server.use(nextI18NextMiddleware(nextI18next));

  server.get("*", (req, res) => handle(req, res));

  const wss = new SocketServer({ server });

    wss.on('connection', function connection(ws, request) {
        console.log('Client connected');
        ws.on('close', () => console.log('Client disconnected'));
    });
    wss.on('error', function (error) {
        console.log(error);
    });

    setInterval(() => {
        wss.clients.forEach((client) => {
          client.send(new Date().toTimeString());
        });
      }, 1000); 
    
    let srv = server.listen(port, err => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })


    srv.on('upgrade', (req, socket, head) => {
      wss.handleUpgrade(req, socket, head, function connected(ws) {
          wss.emit('connection', ws, req);
      })
    });
    /*await server.listen(port);
    console.log(`> Ready on http://localhost:${port}`); // eslint-disable-line no-console*/

})();
