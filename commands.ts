import * as t from '@warden-sk/validation';

export const STORAGE_ROW = new t.InterfaceType({
  createdAt: new t.NumberType(),
  id: new t.StringType(),
  updatedAt: new t.NumberType(),
});

//--------------------------------------------------------------------------------------------------------------- Server

export const CLIENT_STORAGE_ROW = new t.IntersectionType([
  STORAGE_ROW,
  new t.InterfaceType({
    url: new t.StringType(),
  }),
]);

export const CLIENT_STORAGE = new t.TupleType([
  new t.LiteralType('CLIENT_STORAGE'),
  new t.ArrayType(CLIENT_STORAGE_ROW),
]);

export const HISTORY_STORAGE_ROW = new t.IntersectionType([
  STORAGE_ROW,
  new t.InterfaceType({
    clientId: new t.StringType(),
    url: new t.StringType(),
  }),
]);

export const HISTORY_STORAGE = new t.TupleType([
  new t.LiteralType('HISTORY_STORAGE'),
  new t.ArrayType(HISTORY_STORAGE_ROW),
]);

export const MESSAGE_TO_CLIENT = new t.TupleType([
  new t.LiteralType('MESSAGE'),
  new t.InterfaceType({
    createdAt: new t.NumberType(),
    message: new t.StringType(),
  }),
]);

export const commandsFromServer = new t.UnionType([CLIENT_STORAGE, HISTORY_STORAGE, MESSAGE_TO_CLIENT]);

//--------------------------------------------------------------------------------------------------------------- Client

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

export const commandsFromClient = new t.UnionType([MESSAGE_FROM_CLIENT, UPDATE]);
