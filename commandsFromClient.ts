/*
 * Copyright 2022 Marek Kobida
 */

import * as t from '@warden-sk/validation';
import FileStorage from './helpers/FileStorage';

const MESSAGE_COMMAND = t.tuple([
  t.literal('MESSAGE'),
  t.interface({
    message: t.string(), // dokončiť "pattern"
  }),
]);

const SUBSCRIBE_COMMAND = t.tuple([
  t.literal('SUBSCRIBE'),
  t.interface({
    'e-mail': t.string(), // dokončiť "pattern"
  }),
]);

const UPDATE_COMMAND = t.tuple([
  t.literal('UPDATE'),
  t.interface({
    url: t.string(), // dokončiť "pattern"
    windowId: t.string({ pattern: FileStorage.idPattern() }),
  }),
]);

const commandsFromClient = t.union([MESSAGE_COMMAND, SUBSCRIBE_COMMAND, UPDATE_COMMAND]);

export default commandsFromClient;
