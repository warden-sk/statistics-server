/*
 * Copyright 2022 Marek Kobida
 */

import WebSocket from 'ws';

const headers: { [name: string]: string } = {};

const ws = new WebSocket('ws://127.0.0.1:1337', { headers });

ws.on('upgrade', request => {
  const SET_COOKIE_HEADER = request.headers['set-cookie'];

  if (Array.isArray(SET_COOKIE_HEADER)) {
    const FIRST_COOKIE = SET_COOKIE_HEADER[0];

    const pattern = /id=([^;]+)/;

    if (FIRST_COOKIE && pattern.test(FIRST_COOKIE)) {
      const [, id] = pattern.exec(FIRST_COOKIE) ?? [];

      if (id) {
        headers.cookie = `id=${id}`;
      }
    }
  }
});

ws.on('open', () => {
  ws.send('"Marek Kobida"');
});
