/*
 * Copyright 2023 Marek Kobida
 */

import * as h from './helpers';
import * as t from '@warden-sk/validation';

const CLIENT_STORAGE_COMMAND = t.tuple([
  t.literal('CLIENT_STORAGE'),
  t.array(
    t.intersection([
      h.CLIENT_STORAGE_ROW,
      t.interface({
        isActive: t.boolean,
        isKnown: t.boolean,
        name: t.union([t.string(), t.undefined]), // dokončiť
      }),
    ])
  ),
]);

const HISTORY_STORAGE_COMMAND = t.tuple([t.literal('HISTORY_STORAGE'), t.array(h.HISTORY_STORAGE_ROW)]);

const MESSAGE_COMMAND = t.tuple([
  t.literal('MESSAGE'),
  t.interface({
    createdAt: t.number, // dokončiť "pattern"
    message: t.string(), // dokončiť "pattern"
  }),
]);

const commandsFromServer = t.union([CLIENT_STORAGE_COMMAND, HISTORY_STORAGE_COMMAND, MESSAGE_COMMAND]);

export default commandsFromServer;
