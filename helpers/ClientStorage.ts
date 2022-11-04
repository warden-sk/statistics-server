/*
 * Copyright 2022 Marek Kobida
 */

import * as t from '@warden-sk/validation';
import FileStorage, { FILE_STORAGE_ROW } from './FileStorage';
import type KnownClientStorage from './KnownClientStorage';

interface EnhancedClient extends t.TypeOf<typeof CLIENT_STORAGE_ROW> {
  isKnown: boolean;
  name: string;
}

class ClientStorage extends FileStorage<t.TypeOf<typeof CLIENT_STORAGE_ROW>> {
  constructor(readonly knownClientStorage: KnownClientStorage) {
    super('./json/ClientStorage.json', CLIENT_STORAGE_ROW);
  }

  row(id: string): EnhancedClient | undefined {
    const client = super.row(id);

    if (client) {
      return {
        ...client,
        isKnown: this.knownClientStorage.has(client.id),
        name: this.knownClientStorage.row(client.id)?.name ?? client.id,
      };
    }
  }

  rows(): EnhancedClient[] {
    return super.rows().map(client => ({
      ...client,
      isKnown: this.knownClientStorage.has(client.id),
      name: this.knownClientStorage.row(client.id)?.name ?? client.id,
    }));
  }
}

export const CLIENT_STORAGE_ROW = new t.IntersectionType([
  FILE_STORAGE_ROW,
  new t.InterfaceType({
    url: new t.StringType(), // dokončiť "pattern"
  }),
]);

export default ClientStorage;
