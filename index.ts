/*
 * Copyright 2022 Marek Kobida
 */

import * as h from './helpers';
import { WebSocketServer } from 'ws';
import commandsFromClient from './commandsFromClient';
import commandsFromServer from './commandsFromServer';
import { isRight } from '@warden-sk/validation/Either';
import { json_decode } from '@warden-sk/validation/json';

const wss = new WebSocketServer({ port: 1337 });

declare module 'http' {
  interface IncomingMessage {
    clientId?: string | undefined;
  }
}

const clientStorage = new h.ClientStorage(new h.KnownClientStorage());
const historyStorage = new h.HistoryStorage();
const subscriberStorage = new h.SubscriberStorage();

function update() {
  clientStorage.rows().forEach(client => {
    if (client.isKnown) {
      const sendCommand = h.sendCommand(commandsFromServer, json => client.ws?.send(json));

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
      const json = json_decode(data.toString());

      if (isRight(json)) {
        const validation = commandsFromClient.decode(json.right);

        if (isRight(validation)) {
          const [commandName, json] = validation.right;

          if (commandName === 'MESSAGE') {
            clientStorage
              .rows()
              .forEach(client =>
                h.sendCommandToClient(json => client.ws?.send(json))([
                  'MESSAGE',
                  { createdAt: +new Date(), message: json.message },
                ])
              );
          }

          if (commandName === 'SUBSCRIBE') {
            subscriberStorage.add({ id: json['e-mail'] });
          }

          if (commandName === 'UPDATE') {
            clientStorage.update(client.id, json);
            historyStorage.add({ clientId: client.id, message: undefined, url: json.url });
          }

          update();
        }
      }
    });
  }
});

wss.on('headers', (headers, request) => {
  const cookieStorage = new h.CookieStorage();

  const cookies = cookieStorage.readCookies(request.headers['cookie'] ?? '');

  // cookie exists
  if (h.FileStorage.isValidId(cookies.id)) {
    request.clientId = cookies.id;

    return;
  }

  // cookie does not exist
  const clientId = h.FileStorage.id();

  cookieStorage.writeCookie('id', clientId, { HttpOnly: true });

  headers = [...headers, `set-cookie: ${cookieStorage.cookies().join(',')}`];

  request.clientId = clientId;
});

/**/

(['SIGINT', 'SIGTERM'] as const).forEach(signal =>
  process.on(signal, () => {
    historyStorage.add({ clientId: '00000000-0000-0000-0000-000000000000', message: signal, url: undefined });

    process.exit();
  })
);
