import * as t from '@warden-sk/validation';

export const FILE_STORAGE_ROW = new t.InterfaceType({
  createdAt: new t.NumberType(),
  id: new t.StringType(),
  updatedAt: new t.NumberType(),
});

//----------------------------------------------------------------------------------------------------------------------

export const CLIENT_STORAGE = new t.TupleType([new t.LiteralType('CLIENT_STORAGE'), new t.NumberType()]);

export const HISTORY_STORAGE = new t.TupleType([
  new t.LiteralType('HISTORY_STORAGE'),
  new t.IntersectionType([
    FILE_STORAGE_ROW,
    new t.InterfaceType({
      clientId: new t.StringType(),
      url: new t.StringType(),
    }),
  ]),
]);

export const MESSAGE_TO_CLIENT = new t.TupleType([
  new t.LiteralType('MESSAGE'),
  new t.InterfaceType({
    createdAt: new t.NumberType(),
    message: new t.StringType(),
  }),
]);

//----------------------------------------------------------------------------------------------------------------------

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

const commands = new t.UnionType([MESSAGE_FROM_CLIENT, UPDATE]);

export default commands;
