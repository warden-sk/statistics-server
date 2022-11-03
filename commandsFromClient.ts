/*
 * Copyright 2022 Marek Kobida
 */

import * as t from '@warden-sk/validation';
import FileStorage from './helpers/FileStorage';

const MESSAGE_COMMAND = new t.TupleType([
  new t.LiteralType('MESSAGE'),
  new t.InterfaceType({
    message: new t.StringType(), // dokončiť "pattern"
  }),
]);

const SUBSCRIBE_COMMAND = new t.TupleType([
  new t.LiteralType('SUBSCRIBE'),
  new t.InterfaceType({
    'e-mail': new t.StringType(), // dokončiť "pattern"
  }),
]);

const UPDATE_COMMAND = new t.TupleType([
  new t.LiteralType('UPDATE'),
  new t.InterfaceType({
    url: new t.StringType(), // dokončiť "pattern"
    windowId: new t.StringType({ pattern: FileStorage.idPattern() }),
  }),
]);

const commandsFromClient = new t.UnionType([MESSAGE_COMMAND, SUBSCRIBE_COMMAND, UPDATE_COMMAND]);

export default commandsFromClient;
