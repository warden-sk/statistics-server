/*
 * Copyright 2022 Marek Kobida
 */

import ClientStorage from './helpers/ClientStorage';
import HistoryStorage from './helpers/HistoryStorage';
import KnownClientStorage from './helpers/KnownClientStorage';
import commandsFromClient from './commandsFromClient';
import http from 'http';
import report, { ReportType } from './report';
import sendCommand from './helpers/sendCommand';
import { WebSocketServer } from 'ws';
import { isLeft, isRight } from '@warden-sk/validation/functions';
import { json_decode } from '@warden-sk/validation/json';
import CookieStorage from './helpers/CookieStorage';
import FileStorage from './helpers/FileStorage';

const server = http.createServer();
const wss = new WebSocketServer({ server });

declare module 'http' {
  interface IncomingMessage {
    clientId?: string | undefined;
  }
}

const clientStorage = new ClientStorage(new KnownClientStorage());
const historyStorage = new HistoryStorage();

function update() {
  clientStorage.rows().forEach(client => {
    if (client.isKnown) {
      sendCommand(
        [
          ['CLIENT_STORAGE', clientStorage.rows()],
          ['HISTORY_STORAGE', historyStorage.rows()],
        ],
        client
      );
    }
  });
}

wss.on('connection', (ws, request) => {
  if (request.clientId) {
    /* (1) */ clientStorage.add({ id: request.clientId, url: request.url!, ws });
    /* (2) */ const client = clientStorage.row(request.clientId)!;

    ws.on('close', () => {
      /* (1) */ client.ws?.close();
      /* (2) */ delete clientStorage.wss[client.id];
    });

    ws.on('message', data => {
      console.log(new Array(process.stdout.columns + 1).join('\u2014'));

      const json = json_decode(data.toString());

      if (isRight(json)) {
        const validation = commandsFromClient.decode(json.right);

        if (isLeft(validation)) {
          report(ReportType.IN, '[Command]', `"${client.name ?? client.id}"`, 'The command is not valid.');
        }

        if (isRight(validation)) {
          const [commandName, json] = validation.right;

          report(ReportType.IN, '[Command]', `"${client.name ?? client.id}"`, `"${commandName}"`, json);

          if (commandName === 'MESSAGE') {
            clientStorage
              .rows()
              .forEach(client => sendCommand([['MESSAGE', { createdAt: +new Date(), message: json.message }]], client));
          }

          if (commandName === 'UPDATE') {
            clientStorage.update({ id: client.id, url: json.url });
            historyStorage.add({ clientId: client.id, message: undefined, url: json.url });
          }

          update();
        }
      }
    });
  }
});

wss.on('headers', (headers, request) => {
  console.log(new Array(process.stdout.columns + 1).join('\u2014'));

  const cookieStorage = new CookieStorage();

  const cookies = cookieStorage.readCookies(request.headers['cookie'] ?? '');

  // cookie exists
  if (FileStorage.isId(cookies.id)) {
    request.clientId = cookies.id;

    return;
  }

  // cookie does not exist
  const clientId = FileStorage.id();

  cookieStorage.writeCookie('id', clientId, { HttpOnly: true });

  headers.push(`set-cookie: ${cookieStorage.cookies().join(',')}`);

  request.clientId = clientId;
});

server.listen(1337);

/**/

(['SIGINT', 'SIGTERM'] as const).forEach(signal =>
  process.on(signal, () => {
    historyStorage.add({ clientId: '00000000-0000-0000-0000-000000000000', message: signal, url: '/' });

    process.exit();
  })
);
