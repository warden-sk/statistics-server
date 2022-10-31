/*
 * Copyright 2022 Marek Kobida
 */

import * as h from './helpers';
import commandsFromClient from './commandsFromClient';
import commandsFromServer from './commandsFromServer';
import http from 'http';
import { isRight } from '@warden-sk/validation/Either';
import { json_decode } from '@warden-sk/validation/json';

const clientStorage = new h.ClientStorage(new h.KnownClientStorage());
const historyStorage = new h.HistoryStorage();
const subscriberStorage = new h.SubscriberStorage();

const COOKIE_NAME = 'key';

function clientIdFromRequest(request: http.IncomingMessage, response: http.ServerResponse): string {
  const cookieStorage = new h.CookieStorage();

  const cookies = cookieStorage.readCookies(request.headers.cookie ?? '');

  if (h.FileStorage.isValidId(cookies[COOKIE_NAME])) {
    // cookie exists

    return cookies[COOKIE_NAME];
  } else {
    // cookie does not exist

    const id = h.FileStorage.id();

    cookieStorage.writeCookie(COOKIE_NAME, id, { HttpOnly: true });

    response.setHeader('Set-Cookie', cookieStorage.cookies());

    return id;
  }
}

const server = http.createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1');

  const clientId = clientIdFromRequest(request, response);

  /* (1) */ clientStorage.add({ id: clientId, url: request.url! });
  /* (2) */ const client = clientStorage.row(clientId)!;

  if (request.headers['accept'] === 'text/event-stream') {
    response.setHeader('Content-Type', 'text/event-stream');

    clientStorage.wss[client.id] = response;

    request.on('close', () => {
      delete clientStorage.wss[client.id];
    });

    return;
  }

  let $: Buffer[] = [];

  request.on('data', data => ($ = [...$, data]));

  request.on('end', () => {
    const json = json_decode(Buffer.concat($).toString());

    if (isRight(json)) {
      const command = commandsFromClient.decode(json.right);

      if (isRight(command)) {
        const [commandName, json] = command.right;

        if (commandName === 'MESSAGE') {
          clientStorage.rows().forEach(client => {
            h.sendCommandToClient(json => clientStorage.sendMessage(client.id, json))([
              'MESSAGE',
              { createdAt: +new Date(), message: json.message },
            ]);
          });
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

    response.end();
  });
});

function update() {
  clientStorage.rows().forEach(client => {
    const sendCommand = h.sendCommand(commandsFromServer, json => clientStorage.sendMessage(client.id, json));

    sendCommand(['CLIENT_STORAGE', clientStorage.rows()]);
    sendCommand(['HISTORY_STORAGE', historyStorage.rows()]);
  });
}

server.listen(1337);

/**/

(['SIGINT', 'SIGTERM'] as const).forEach(signal =>
  process.on(signal, () => {
    historyStorage.add({ clientId: '00000000-0000-0000-0000-000000000000', message: signal, url: undefined });

    process.exit();
  })
);
