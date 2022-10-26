/*
 * Copyright 2022 Marek Kobida
 */

import commandsFromServer from '../commandsFromServer';
import type { EnhancedClientRow } from './ClientStorage';
import type { TypeOf } from '@warden-sk/validation/types';
import { isRight } from '@warden-sk/validation/functions';
import { json_encode } from '@warden-sk/validation/json';

function sendCommand(commands: TypeOf<typeof commandsFromServer>[], client: EnhancedClientRow) {
  commands.forEach(command => {
    const _1 = commandsFromServer.decode(command);

    if (isRight(_1)) {
      const _2 = json_encode(_1.right);

      if (isRight(_2)) {
        client.ws?.send(_2.right);
      }
    }
  });
}

export default sendCommand;
