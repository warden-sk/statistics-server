/*
 * Copyright 2022 Marek Kobida
 */

import http from 'http';
import { WebSocketServer } from 'ws';
import report from './report';
import CookieStorage from './helpers/CookieStorage';
import KnownClientStorage from './helpers/KnownClientStorage';
import type { Client } from './helpers/ClientStorage';
import ClientStorage from './helpers/ClientStorage';
import HistoryStorage from './helpers/HistoryStorage';

const server = http.createServer();
const wss = new WebSocketServer({ server });

declare module 'http' {
  interface IncomingMessage {
    clientId: string;
  }
}

const clientStorage = new ClientStorage();
const historyStorage = new HistoryStorage();
const knownClientStorage = new KnownClientStorage();

knownClientStorage.add({ id: '1666188291859', name: 'Marek Kobida' });

/**/

function sendMessage(client: Client, json: [string, any]) {
  report(2, '[Message]', `"${knownClientStorage.row(client.id)?.name ?? client.id}"`, json);

  client.ws.send(JSON.stringify(json));
}

function update() {
  clientStorage.rows().forEach(client => {
    if (knownClientStorage.has(client.id)) {
      sendMessage(client, ['CLIENTS', clientStorage.size()]);
      sendMessage(client, ['HISTORY', historyStorage.rows()]);
    }
  });
}

setInterval(update, 2500);

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

      clientStorage.delete(request.clientId);
    }
  });

  ws.on('message', data => {
    console.log(new Array(process.stdout.columns + 1).join('\u2014'));

    const input = JSON.parse(data.toString());

    if (Array.isArray(input) && input.length === 2) {
      const [commandName, json] = input;

      report(
        1,
        '[Command]',
        `"${knownClientStorage.row(request.clientId)?.name ?? request.clientId}"`,
        `"${commandName}"`,
        json
      );

      if (commandName === 'CLIENT_UPDATE_URL') {
        clientStorage.update({ id: request.clientId, url: json.url });

        historyStorage.add({
          clientAddress: request.socket.remoteAddress!,
          clientId: request.clientId,
          id: (+new Date()).toString(),
          url: json.url,
        });
      }

      if (commandName === 'TEST') {
        clientStorage
          .rows()
          .forEach(client => sendMessage(client, ['TEST', { createdAt: +new Date(), message: json.message }]));
      }
    }
  });
});

server.listen(8080);
