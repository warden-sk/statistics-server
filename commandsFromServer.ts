/*
 * Copyright 2022 Marek Kobida
 */

import * as h from './helpers';
import * as t from '@warden-sk/validation';

export const CLIENT_STORAGE_COMMAND = new t.TupleType([
  new t.LiteralType('CLIENT_STORAGE'),
  new t.ArrayType(h.CLIENT_STORAGE_ROW),
]);

export const HISTORY_STORAGE_COMMAND = new t.TupleType([
  new t.LiteralType('HISTORY_STORAGE'),
  new t.ArrayType(h.HISTORY_STORAGE_ROW),
]);

export const MESSAGE_COMMAND = new t.TupleType([
  new t.LiteralType('MESSAGE'),
  new t.InterfaceType({
    createdAt: new t.NumberType(),
    message: new t.StringType(),
  }),
]);

const commandsFromServer = new t.UnionType([CLIENT_STORAGE_COMMAND, HISTORY_STORAGE_COMMAND, MESSAGE_COMMAND]);

export default commandsFromServer;
