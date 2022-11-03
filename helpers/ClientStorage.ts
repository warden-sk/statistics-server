/*
 * Copyright 2022 Marek Kobida
 */

import * as t from '@warden-sk/validation';
import FileStorage, { FILE_STORAGE_ROW } from './FileStorage';
import type KnownClientStorage from './KnownClientStorage';
import type { TypeOf } from '@warden-sk/validation/types';
import type stream from 'stream';

interface EnhancedClient extends TypeOf<typeof CLIENT_STORAGE_ROW> {
  isKnown: boolean;
  name?: string;
}

class ClientStorage extends FileStorage<TypeOf<typeof CLIENT_STORAGE_ROW>> {
  wss: { [id: string]: stream.Writable | undefined } = {};

  constructor(readonly knownClientStorage: KnownClientStorage) {
    super('./json/ClientStorage.json', CLIENT_STORAGE_ROW);
  }

  row(id: string): EnhancedClient | undefined {
    const client = super.row(id);

    if (client) {
      return {
        ...client,
        isKnown: this.knownClientStorage.has(client.id),
        name: this.knownClientStorage.row(client.id)?.name,
      };
    }
  }

  rows(): EnhancedClient[] {
    return super.rows().map(client => ({
      ...client,
      isKnown: this.knownClientStorage.has(client.id),
      name: this.knownClientStorage.row(client.id)?.name,
    }));
  }

  sendMessage(id: string, json: string) {
    this.wss[id]?.write(`data: ${json}\n\n`);
  }
}

export const CLIENT_STORAGE_ROW = new t.IntersectionType([
  FILE_STORAGE_ROW,
  new t.InterfaceType({
    url: new t.StringType(),
  }),
]);

export default ClientStorage;
