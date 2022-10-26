/*
 * Copyright 2022 Marek Kobida
 */

import commandsFromServer from '../commandsFromServer';
import type { EnhancedClient } from './ClientStorage';
import type { TypeOf } from '@warden-sk/validation/types';
import { isRight } from '@warden-sk/validation/functions';

function sendCommand(commands: TypeOf<typeof commandsFromServer>[], client: EnhancedClient) {
  commands.forEach(command => {
    const validation = commandsFromServer.decode(command);

    if (isRight(validation)) {
      client.ws.send(JSON.stringify(validation.right));
    }
  });
}

export default sendCommand;
