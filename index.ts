/*
 * Copyright 2022 Marek Kobida
 */

import http from 'http';
import type { WebSocket } from 'ws';
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

const clientStorage = new ClientStorage();
const historyStorage = new HistoryStorage();
const knownClientStorage = new KnownClientStorage();

/**/

function sendMessage(ws: WebSocket, json: any) {
  report(2, '[Message]', json);

  ws.send(JSON.stringify(json));
}

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
        historyStorage.add({ id: (+new Date()).toString(), url: json.url });

        clientStorage.rows().forEach(client => {
          if (knownClientStorage.has(request.clientId)) {
            sendMessage(client.ws, ['CLIENTS', clientStorage.size()]);
            sendMessage(client.ws, ['HISTORY', historyStorage.rows()]);
          }
        });

        clientStorage.update({ id: request.clientId, url: json.url });
      }

      if (commandName === 'TEST') {
        clientStorage
          .rows()
          .forEach(client => sendMessage(client.ws, ['TEST', { createdAt: +new Date(), message: json.message }]));
      }
    }
  });
});

server.listen(8080);
