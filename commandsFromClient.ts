/*
 * Copyright 2022 Marek Kobida
 */

import * as t from '@warden-sk/validation';

const MESSAGE_FROM_CLIENT = new t.TupleType([
  new t.LiteralType('MESSAGE'),
  new t.InterfaceType({
    message: new t.StringType(),
  }),
]);

const UPDATE = new t.TupleType([
  new t.LiteralType('UPDATE'),
  new t.InterfaceType({
    url: new t.StringType(),
  }),
]);

const commandsFromClient = new t.UnionType([MESSAGE_FROM_CLIENT, UPDATE]);

export default commandsFromClient;
