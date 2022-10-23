/*
 * Copyright 2022 Marek Kobida
 */

import ClientStorage from './helpers/ClientStorage';
import CookieStorage from './helpers/CookieStorage';
import HistoryStorage from './helpers/HistoryStorage';
import KnownClientStorage from './helpers/KnownClientStorage';
import http from 'http';
import report from './report';
import sendCommand from './helpers/sendCommand';
import { WebSocketServer } from 'ws';
import { commandsFromClient } from './commands';
import { isRight } from '@warden-sk/validation/functions';

const server = http.createServer();
const wss = new WebSocketServer({ server });

declare module 'http' {
  interface IncomingMessage {
    clientId: string;
  }
}

const knownClientStorage = new KnownClientStorage();

const clientStorage = new ClientStorage(knownClientStorage);
const historyStorage = new HistoryStorage();

/**/

function update() {
  clientStorage.rows().forEach(client => {
    if (client.isKnown) {
      sendCommand(['CLIENT_STORAGE', clientStorage.rows()], client);
      sendCommand(['HISTORY_STORAGE', historyStorage.rows()], client);
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

    const input = commandsFromClient.decode(JSON.parse(data.toString()));

    if (isRight(input)) {
      const [commandName, json] = input.right;

      report(
        1,
        '[Command]',
        `"${knownClientStorage.row(request.clientId)?.name ?? request.clientId}"`,
        `"${commandName}"`,
        json
      );

      if (commandName === 'MESSAGE') {
        clientStorage
          .rows()
          .forEach(client => sendCommand(['MESSAGE', { createdAt: +new Date(), message: json.message }], client));
      }

      if (commandName === 'UPDATE') {
        clientStorage.update({ id: request.clientId, url: json.url });

        historyStorage.add({ clientId: request.clientId, url: json.url });
      }
    }
  });
});

server.listen(8080);
