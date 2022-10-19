/*
 * Copyright 2022 Marek Kobida
 */

import http from 'http';
import { WebSocketServer } from 'ws';
import report from './report';
import CookieStorage from './helpers/CookieStorage';
import KnownClientStorage from './helpers/KnownClientStorage';
import ClientStorage from './helpers/ClientStorage';
import HistoryStorage from './helpers/HistoryStorage';

const server = http.createServer();
const wss = new WebSocketServer({ server });

declare module 'http' {
  interface IncomingMessage {
    clientId: string;
  }
}

const knownClientStorage = new KnownClientStorage();
knownClientStorage.add({ id: '1666188291859', name: 'Marek Kobida' });

const clientStorage = new ClientStorage(knownClientStorage);
const historyStorage = new HistoryStorage();

/**/

function update() {
  clientStorage.rows().forEach(client => {
    if (client.isKnown) {
      client.ws.send(JSON.stringify(['CLIENTS', clientStorage.size()]));
      client.ws.send(JSON.stringify(['HISTORY', historyStorage.rows()]));
    }
  });
}

setInterval(update, 1000);

wss.on('headers', (headers, request) => {
  const cookieStorage = new CookieStorage();

  const cookies = cookieStorage.readCookies(request.headers['cookie'] ?? '');

  // cookie exists
  if (cookies.id !== undefined) {
    request.clientId = cookies.id;

    return;
  }

  // cookie does not exist
  const clientId = (+new Date()).toString();

  cookieStorage.writeCookie('id', clientId, { HttpOnly: true });

  headers.push(`Set-Cookie: ${cookieStorage.cookies().join(',')}`);

  request.clientId = clientId;
});

wss.on('connection', (ws, request) => {
  clientStorage.add({ id: request.clientId, url: request.url!, ws });

  ws.on('close', () => {
    const client = clientStorage.row(request.clientId);

    if (client) {
      client.ws.close();
    }
  });

  ws.on('message', data => {
    console.log(new Array(process.stdout.columns + 1).join('\u2014'));

    const input = JSON.parse(data.toString());

    if (Array.isArray(input) && input.length === 2) {
      const [commandName, json] = input;

      if (typeof commandName === 'string') {
        report(
          1,
          '[Command]',
          `"${knownClientStorage.row(request.clientId)?.name ?? request.clientId}"`,
          `"${commandName}"`,
          json
        );

        if (commandName === 'CLIENT_UPDATE_URL') {
          clientStorage.update({ id: request.clientId, url: json.url });

          historyStorage.add({ clientId: request.clientId, url: json.url });
        }

        if (commandName === 'TEST') {
          clientStorage
            .rows()
            .forEach(client =>
              client.ws.send(JSON.stringify(['TEST', { createdAt: +new Date(), message: json.message }]))
            );
        }
      }
    }
  });
});

server.listen(8080);
