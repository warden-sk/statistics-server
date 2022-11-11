/*
 * Copyright 2022 Marek Kobida
 */

import { chainW, right } from '@warden-sk/validation/either';
import type { Either } from '@warden-sk/validation/either';
import type Type from '@warden-sk/validation/helpers/Type';
import type { TypeOf } from '@warden-sk/validation/types';
import commandsFromClient from '../commandsFromClient';
import commandsFromServer from '../commandsFromServer';
import { json_encode } from '@warden-sk/validation/helpers/json';
import pipe from '@warden-sk/validation/pipe';

function sendCommand<Of extends Type<any>>(
  of: Of,
  on: (json: string) => void
): <Command extends TypeOf<Of>>(command: Command) => Either<unknown, true> {
  return command =>
    pipe(
      /* (1) */ command,
      /* (2) */ of.decode,
      /* (3) */ chainW(json_encode),
      /* (4) */ chainW(json => {
        on(json);

        return right(true);
      })
    );
}

export function sendCommandToClient(
  on: (json: string) => void
): <Command extends TypeOf<typeof commandsFromServer>>(command: Command) => Either<unknown, true> {
  return command => sendCommand(commandsFromServer, on)(command);
}

export function sendCommandToServer(
  on: (json: string) => void
): <Command extends TypeOf<typeof commandsFromClient>>(command: Command) => Either<unknown, true> {
  return command => sendCommand(commandsFromClient, on)(command);
}

export default sendCommand;
