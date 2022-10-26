/*
 * Copyright 2022 Marek Kobida
 */

import * as t from '@warden-sk/validation';
import { UnionType } from '@warden-sk/validation';

export const STORAGE_ROW = new t.InterfaceType({
  createdAt: new t.NumberType(),
  id: new t.StringType(),
  updatedAt: new t.NumberType(),
});

//----------------------------------------------------------------------------------------------------------------------

export const CLIENT_STORAGE_ROW = new t.IntersectionType([
  STORAGE_ROW,
  new t.InterfaceType({
    url: new t.StringType(),
  }),
]);

export const CLIENT_STORAGE_COMMAND = new t.TupleType([
  new t.LiteralType('CLIENT_STORAGE'),
  new t.ArrayType(CLIENT_STORAGE_ROW),
]);

//----------------------------------------------------------------------------------------------------------------------

export const HISTORY_STORAGE_ROW = new t.IntersectionType([
  STORAGE_ROW,
  new t.InterfaceType({
    clientId: new t.StringType(),
    message: new UnionType([new t.StringType(), new t.UndefinedType()]),
    url: new t.StringType(),
  }),
]);

export const HISTORY_STORAGE_COMMAND = new t.TupleType([
  new t.LiteralType('HISTORY_STORAGE'),
  new t.ArrayType(HISTORY_STORAGE_ROW),
]);

//----------------------------------------------------------------------------------------------------------------------

export const KNOWN_CLIENT_ROW = new t.IntersectionType([
  STORAGE_ROW,
  new t.InterfaceType({
    name: new t.StringType(),
  }),
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
