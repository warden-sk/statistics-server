/*
 * Copyright 2022 Marek Kobida
 */

import commandsFromServer from '../commandsFromServer';
import report from '../report';
import type { EnhancedClient } from './ClientStorage';
import type { TypeOf } from '@warden-sk/validation/types';
import { isLeft, isRight } from '@warden-sk/validation/functions';

function sendCommand(command: TypeOf<typeof commandsFromServer>, client: EnhancedClient) {
  const validation = commandsFromServer.decode(command);

  if (isLeft(validation)) {
    report(undefined, '[Command]', 'The command is not valid.');
  }

  if (isRight(validation)) {
    client.ws.send(JSON.stringify(validation.right));
  }
}

export default sendCommand;
