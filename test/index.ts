/*
 * Copyright 2022 Marek Kobida
 */

import WebSocket from 'ws';
import * as h from '../helpers';

function $() {
  const headers: { [name: string]: string | undefined } = {};

  const ws = new WebSocket('ws://127.0.0.1:1337', { headers });

  //--------------------------------------------------------------------------------------------------------------------

  ws.on('error', $);

  ws.on('open', () => {
    const sendCommand = h.sendCommandToServer(ws);

    sendCommand(['UPDATE', { url: '/test' }]);
  });

  //--------------------------------------------------------------------------------------------------------------------

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
}

$();
