import * as t from '@warden-sk/validation';

const CLIENT_UPDATE_URL = new t.TupleType([
  new t.LiteralType('CLIENT_UPDATE_URL'),
  new t.InterfaceType({
    url: new t.StringType(),
  }),
]);

const TEST = new t.TupleType([
  new t.LiteralType('TEST'),
  new t.InterfaceType({
    message: new t.StringType(),
  }),
]);

const commands = new t.UnionType([CLIENT_UPDATE_URL, TEST]);

export default commands;
