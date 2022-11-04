/*
 * Copyright 2022 Marek Kobida
 */

import * as h from './helpers';
import * as t from '@warden-sk/validation';

const CLIENT_STORAGE_COMMAND = new t.TupleType([
  new t.LiteralType('CLIENT_STORAGE'),
  new t.ArrayType(
    new t.IntersectionType([
      h.CLIENT_STORAGE_ROW,
      new t.InterfaceType({
        isActive: new t.BooleanType(),
        isKnown: new t.BooleanType(),
        name: new t.UnionType([new t.StringType(), new t.UndefinedType()]), // dokončiť
      }),
    ])
  ),
]);

const HISTORY_STORAGE_COMMAND = new t.TupleType([
  new t.LiteralType('HISTORY_STORAGE'),
  new t.ArrayType(h.HISTORY_STORAGE_ROW),
]);

const MESSAGE_COMMAND = new t.TupleType([
  new t.LiteralType('MESSAGE'),
  new t.InterfaceType({
    createdAt: new t.NumberType(), // dokončiť "pattern"
    message: new t.StringType(), // dokončiť "pattern"
  }),
]);

const commandsFromServer = new t.UnionType([CLIENT_STORAGE_COMMAND, HISTORY_STORAGE_COMMAND, MESSAGE_COMMAND]);

export default commandsFromServer;
