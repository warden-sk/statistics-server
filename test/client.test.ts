/*
 * Copyright 2022 Marek Kobida
 */

import WebSocket from 'ws';
import type { TypeOf } from '@warden-sk/validation/types';
import { json_encode } from '@warden-sk/validation/json';
import type commandsFromClient from '../commandsFromClient';
import { isRight } from '@warden-sk/validation/functions';
import report from '../report';

const headers: { [name: string]: string | undefined } = {};

const ws = new WebSocket('ws://127.0.0.1:1337', { headers });

//----------------------------------------------------------------------------------------------------------------------

ws.on('open', () => {
  function send(command: TypeOf<typeof commandsFromClient>) {
    const encoded = json_encode(command);

    if (isRight(encoded)) {
      report(undefined, encoded.right);

      ws.send(encoded.right);
    }
  }

  send(['UPDATE', { url: '/test' }]);
});

//----------------------------------------------------------------------------------------------------------------------

ws.on('upgrade', request => {
  const SET_COOKIE_HEADER = request.headers['set-cookie'];

  if (Array.isArray(SET_COOKIE_HEADER)) {
    const FIRST_COOKIE = SET_COOKIE_HEADER[0];
    const PATTERN = /id=([^;]+)/;

    if (FIRST_COOKIE && PATTERN.test(FIRST_COOKIE)) {
      const [, id] = PATTERN.exec(FIRST_COOKIE) ?? [];

      if (id) {
        headers.cookie = `id=${id}`;
      }
    }
  }
});
