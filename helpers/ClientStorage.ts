/*
 * Copyright 2022 Marek Kobida
 */

import FileStorage, { FILE_STORAGE_ROW } from './FileStorage';
import type KnownClientStorage from './KnownClientStorage';
import type { WebSocket } from 'ws';
import type { TypeOf } from '@warden-sk/validation/types';
import * as t from '@warden-sk/validation';

export const CLIENT_STORAGE_ROW = new t.IntersectionType([
  FILE_STORAGE_ROW,
  new t.InterfaceType({
    url: new t.StringType(),
  }),
]);

interface EnhancedClient extends TypeOf<typeof CLIENT_STORAGE_ROW> {
  isKnown: boolean;
  name?: string | undefined;
  ws?: WebSocket | undefined;
}

class ClientStorage extends FileStorage<TypeOf<typeof CLIENT_STORAGE_ROW>> {
  wss: { [clientId: string]: WebSocket | undefined } = {};

  constructor(readonly knownClientStorage: KnownClientStorage) {
    super('./json/ClientStorage.json', CLIENT_STORAGE_ROW);
  }

  add({ ws, ...client }: Omit<EnhancedClient, 'createdAt' | 'isKnown' | 'name' | 'updatedAt'>) {
    super.add(client);

    this.wss[client.id] = ws;
  }

  row(id: string): EnhancedClient | undefined {
    const client = super.row(id);

    if (client) {
      return {
        ...client,
        isKnown: this.knownClientStorage.has(client.id),
        name: this.knownClientStorage.row(client.id)?.name,
        ws: this.wss[client.id],
      };
    }
  }

  rows(): EnhancedClient[] {
    return super.rows().map(client => ({
      ...client,
      isKnown: this.knownClientStorage.has(client.id),
      name: this.knownClientStorage.row(client.id)?.name,
      ws: this.wss[client.id],
    }));
  }
}

export default ClientStorage;
