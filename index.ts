/*
 * Copyright 2022 Marek Kobida
 */

import ClientStorage from './helpers/ClientStorage';
import CookieStorage from './helpers/CookieStorage';
import FileStorage from './helpers/FileStorage';
import HistoryStorage from './helpers/HistoryStorage';
import KnownClientStorage from './helpers/KnownClientStorage';
import commandsFromClient from './commandsFromClient';
import http from 'http';
import report, { ReportType } from './report';
import sendCommand from './helpers/sendCommand';
import { WebSocketServer } from 'ws';
import { isLeft, isRight } from '@warden-sk/validation/functions';
import { json_decode } from './helpers/json';

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

wss.on('headers', (headers, request) => {
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

wss.on('connection', (ws, request) => {
  clientStorage.add({ id: request.clientId, url: request.url!, ws });

  const client = clientStorage.row(request.clientId);

  ws.on('close', () => {
    if (client) {
      client.ws.close();
    }
  });

  ws.on('message', data => {
    if (client) {
      console.log(new Array(process.stdout.columns + 1).join('\u2014'));

      const validation = commandsFromClient.decode(json_decode(data.toString()));

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
          historyStorage.add({ clientId: client.id, url: json.url });
        }

        update();
      }
    }
  });
});

server.listen(8080);

/**/

function on(codeOrName: number | string, code?: number | undefined) {
  if (typeof codeOrName === 'number') {
    process.exit(codeOrName);
  }

  if (typeof codeOrName === 'string' && typeof code === 'number') {
    report(undefined, `[${codeOrName}]`, code);

    process.exit(code);
  }
}

process.on('SIGINT', on);
process.on('SIGTERM', on);
process.on('exit', on);
process.on('uncaughtException', on);
