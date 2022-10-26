/*
 * Copyright 2022 Marek Kobida
 */

import * as t from '@warden-sk/validation';
import { HISTORY_STORAGE_ROW } from './helpers/HistoryStorage';
import { CLIENT_STORAGE_ROW } from './helpers/ClientStorage';

export const CLIENT_STORAGE_COMMAND = new t.TupleType([
  new t.LiteralType('CLIENT_STORAGE'),
  new t.ArrayType(CLIENT_STORAGE_ROW),
]);

//----------------------------------------------------------------------------------------------------------------------

export const HISTORY_STORAGE_COMMAND = new t.TupleType([
  new t.LiteralType('HISTORY_STORAGE'),
  new t.ArrayType(HISTORY_STORAGE_ROW),
]);

//----------------------------------------------------------------------------------------------------------------------

export const MESSAGE_TO_CLIENT_COMMAND = new t.TupleType([
  new t.LiteralType('MESSAGE'),
  new t.InterfaceType({
    createdAt: new t.NumberType(),
    message: new t.StringType(),
  }),
]);

const commandsFromServer = new t.UnionType([
  CLIENT_STORAGE_COMMAND,
  HISTORY_STORAGE_COMMAND,
  MESSAGE_TO_CLIENT_COMMAND,
]);

export default commandsFromServer;
