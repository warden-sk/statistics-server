/*
 * Copyright 2022 Marek Kobida
 */

import commandsFromClient from '../commandsFromClient';
import type WebSocket from 'ws';
import type { TypeOf } from '@warden-sk/validation/types';
import { isRight } from '@warden-sk/validation/functions';
import { json_encode } from '@warden-sk/validation/json';

function sendCommand(ws: WebSocket): (command: TypeOf<typeof commandsFromClient>) => unknown {
  return command => {
    const _1 = commandsFromClient.decode(command);

    if (isRight(_1)) {
      const _2 = json_encode(_1.right);

      if (isRight(_2)) {
        ws.send(_2.right);
      }
    }
  };
}

export default sendCommand;
