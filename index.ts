/*
 * Copyright 2022 Marek Kobida
 */

import commandsFromClient from './commandsFromClient';
import http from 'http';
import report, { ReportType } from './report';
import { WebSocketServer } from 'ws';
import { isLeft, isRight } from '@warden-sk/validation/Either';
import { json_decode } from '@warden-sk/validation/json';
import commandsFromServer from './commandsFromServer';
import * as h from './helpers';

const server = http.createServer();
const wss = new WebSocketServer({ server });

declare module 'http' {
  interface IncomingMessage {
    clientId?: string | undefined;
  }
}

const clientStorage = new h.ClientStorage(new h.KnownClientStorage());
const historyStorage = new h.HistoryStorage();

function update() {
  clientStorage.rows().forEach(client => {
    if (client.isKnown && client.ws) {
      const sendCommand = h.sendCommand(commandsFromServer, client.ws);

      sendCommand(['CLIENT_STORAGE', clientStorage.rows()]);
      sendCommand(['HISTORY_STORAGE', historyStorage.rows()]);
    }
  });
}

wss.on('connection', (ws, request) => {
  if (request.clientId) {
    /* (1) */ clientStorage.add({ id: request.clientId, url: request.url!, ws });
    /* (2) */ const client = clientStorage.row(request.clientId)!;

    ws.on('close', () => {
      delete clientStorage.wss[client.id];
    });

    ws.on('message', data => {
      console.log(new Array(process.stdout.columns + 1).join('\u2014'));

      const json = json_decode(data.toString());

      if (isRight(json)) {
        const validation = commandsFromClient.decode(json.right);

        if (isLeft(validation)) {
          report(ReportType.IN, '[Command]', `"${client.name ?? client.id}"`, 'The command is not valid.');

          client.ws?.close();
        }

        if (isRight(validation)) {
          const [commandName, json] = validation.right;

          report(ReportType.IN, '[Command]', `"${client.name ?? client.id}"`, `"${commandName}"`, json);

          if (commandName === 'MESSAGE') {
            clientStorage
              .rows()
              .forEach(
                client =>
                  client.ws &&
                  h.sendCommandToClient(client.ws)(['MESSAGE', { createdAt: +new Date(), message: json.message }])
              );
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

  const cookieStorage = new h.CookieStorage();

  const cookies = cookieStorage.readCookies(request.headers['cookie'] ?? '');

  // cookie exists
  if (h.FileStorage.isId(cookies.id)) {
    request.clientId = cookies.id;

    return;
  }

  // cookie does not exist
  const clientId = h.FileStorage.id();

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
