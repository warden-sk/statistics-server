/*
 * Copyright 2022 Marek Kobida
 */

import http from 'http';
import { WebSocketServer } from 'ws';
import report from './report';
import CookieStorage from './helpers/CookieStorage';
import KnownClientStorage from './helpers/KnownClientStorage';
import type { EnhancedClient } from './helpers/ClientStorage';
import ClientStorage from './helpers/ClientStorage';
import HistoryStorage from './helpers/HistoryStorage';
import { commandsFromClient, commandsFromServer } from './commands';
import { isLeft, isRight } from '@warden-sk/validation/functions';
import type { TypeOf } from '@warden-sk/validation/types';

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

function sendCommand(command: TypeOf<typeof commandsFromServer>, client: EnhancedClient) {
  const validation = commandsFromServer.decode(command);

  if (isLeft(validation)) {
    report(undefined, '[Command]', 'The command is not valid.');
  }

  if (isRight(validation)) {
    client.ws.send(JSON.stringify(validation.right));
  }
}

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
