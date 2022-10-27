/*
 * Copyright 2022 Marek Kobida
 */

import commandsFromClient from '../commandsFromClient';
import commandsFromServer from '../commandsFromServer';
import pipe from '@warden-sk/validation/pipe';
import type Type from '@warden-sk/validation/Type';
import type WebSocket from 'ws';
import type { Either } from '@warden-sk/validation/Either';
import { chainW, right } from '@warden-sk/validation/Either';
import type { TypeOf } from '@warden-sk/validation/types';
import { json_encode } from '@warden-sk/validation/json';

function sendCommand<Of extends Type<any>>(
  of: Of,
  ws: WebSocket
): <Command extends TypeOf<Of>>(command: Command) => Either<unknown, true> {
  return command =>
    pipe(
      /* (1) */ command,
      /* (2) */ of.decode,
      /* (3) */ chainW(json_encode),
      /* (4) */ chainW(json => {
        ws.send(json);

        return right(true);
      })
    );
}

export function sendCommandToClient(
  ws: WebSocket
): <Command extends TypeOf<typeof commandsFromServer>>(command: Command) => Either<unknown, true> {
  return command => sendCommand(commandsFromServer, ws)(command);
}

export function sendCommandToServer(
  ws: WebSocket
): <Command extends TypeOf<typeof commandsFromClient>>(command: Command) => Either<unknown, true> {
  return command => sendCommand(commandsFromClient, ws)(command);
}

export default sendCommand;
