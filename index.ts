/*
 * Copyright 2022 Marek Kobida
 */

import * as h from './helpers';
import { chainW, isRight, right } from '@warden-sk/validation/Either';
import { json_decode, json_encode } from '@warden-sk/validation/json';
import type { Either } from '@warden-sk/validation/Either';
import commandsFromClient from './commandsFromClient';
import http from 'http';
import pipe from '@warden-sk/validation/pipe';
import type stream from 'stream';

const clientStorage = new h.ClientStorage(new h.KnownClientStorage());
const historyStorage = new h.HistoryStorage();
const subscriberStorage = new h.SubscriberStorage();

const COOKIE_NAME = 'key';

function keyFromRequest(request: http.IncomingMessage, response: http.ServerResponse): string {
  const cookieStorage = new h.CookieStorage();

  const cookies = cookieStorage.readCookies(request.headers.cookie ?? '');

  if (h.FileStorage.isValidId(cookies[COOKIE_NAME])) {
    // cookie exists

    return cookies[COOKIE_NAME];
  } else {
    // cookie does not exist

    const key = h.FileStorage.id();

    cookieStorage.writeCookie(COOKIE_NAME, key, { HttpOnly: true });

    response.setHeader('Set-Cookie', cookieStorage.cookies());

    return key;
  }
}

function send_json($: stream.Writable): (json: Parameters<typeof json_encode>[0]) => Either<unknown, stream.Writable> {
  return json =>
    pipe(
      json,
      json_encode,
      chainW(json => right($.end(json)))
    );
}

const server = http.createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1');
  response.setHeader('Content-Type', 'application/json');

  const clientId = keyFromRequest(request, response);

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

  if (request.method === 'POST') {
    let $ = '';

    request.on('data', data => ($ += data));

    request.on('end', () => {
      const command = pipe($, json_decode, chainW(commandsFromClient.decode));

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

        clientStorage.rows().forEach(client => {
          const sendCommand = h.sendCommandToClient(json => clientStorage.sendMessage(client.id, json));

          sendCommand(['CLIENT_STORAGE', clientStorage.rows()]);
          sendCommand(['HISTORY_STORAGE', historyStorage.rows()]);
        });
      }
    });
  }

  send_json(response)({ server: '1.0.0' });
});

server.listen(1337);

/**/

(['SIGINT', 'SIGTERM'] as const).forEach(signal =>
  process.on(signal, () => {
    historyStorage.add({ clientId: '00000000-0000-0000-0000-000000000000', message: signal, url: undefined });

    process.exit();
  })
);
