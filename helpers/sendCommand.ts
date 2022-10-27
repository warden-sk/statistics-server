/*
 * Copyright 2022 Marek Kobida
 */

import type { Either } from '@warden-sk/validation/Either';
import { chainW, right } from '@warden-sk/validation/Either';
import { json_encode } from '@warden-sk/validation/json';
import pipe from '@warden-sk/validation/pipe';
import type WebSocket from 'ws';
import type { TypeOf } from '@warden-sk/validation/types';
import type Type from '@warden-sk/validation/Type';

function sendCommand(of: Type<any>, ws: WebSocket): <T extends TypeOf<typeof of>>(command: T) => Either<unknown, true> {
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

export default sendCommand;
