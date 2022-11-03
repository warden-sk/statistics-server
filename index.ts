/*
 * Copyright 2022 Marek Kobida
 */

import * as h from './helpers';
import { chainW, isLeft, isRight } from '@warden-sk/validation/Either';
import commandsFromClient from './commandsFromClient';
import http from 'http';
import { json_decode } from '@warden-sk/validation/json';
import pipe from '@warden-sk/validation/pipe';

const clientStorage = new h.ClientStorage(new h.KnownClientStorage());
const historyStorage = new h.HistoryStorage();
const subscriberStorage = new h.SubscriberStorage();

function headersFromRequest(request: http.IncomingMessage): Headers {
  const headers = request.headers;

  const enhancedHeaders = new Headers();

  for (const key in headers) {
    const header = headers[key];

    if (typeof header === 'string') {
      enhancedHeaders.set(key, header);
    }
  }

  return enhancedHeaders;
}

const server = http.createServer((request, response) => {
  const headers = new Headers({
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': 'http://127.0.0.1',
    'Content-Type': 'application/json',
  });

  const [key, windowId] = h.keyFromRequest(headersFromRequest(request), headers);

  [...headers].forEach(([l, r]) => response.setHeader(l, r));

  /* (1) */ clientStorage.add({ id: key, url: request.url! });
  /* (2) */ const client = clientStorage.row(key)!;

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

      if (isLeft(command)) {
        if (typeof command.left === 'string') {
          return h.send_json(response)(command.left);
        }

        return h.send_json(response)(h.messages.COMMAND_NOT_VALID);
      }

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

          historyStorage.add({ clientId: client.id, message: undefined, url: json.url, windowId });
        }

        clientStorage.rows().forEach(client => {
          if (client.isKnown) {
            const sendCommand = h.sendCommandToClient(json => clientStorage.sendMessage(client.id, json));

            sendCommand(['CLIENT_STORAGE', clientStorage.rows()]);
            sendCommand(['HISTORY_STORAGE', historyStorage.rows()]);
          }
        });
      }
    });
  }

  return h.send_json(response)(h.messages.REQUEST_NOT_VALID);
});

server.listen(1337);

/**/

(['SIGINT', 'SIGTERM'] as const).forEach(signal =>
  process.on(signal, () => {
    const id = '00000000-0000-0000-0000-000000000000';

    historyStorage.add({ clientId: id, message: signal, url: undefined, windowId: id });

    process.exit();
  })
);
