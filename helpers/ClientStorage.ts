/*
 * Copyright 2022 Marek Kobida
 */

import FileStorage from './FileStorage';
import type KnownClientStorage from './KnownClientStorage';
import type { WebSocket } from 'ws';
import { CLIENT_STORAGE_ROW } from '../commandsFromServer';
import type { TypeOf } from '@warden-sk/validation/types';

export interface EnhancedClientRow extends TypeOf<typeof CLIENT_STORAGE_ROW> {
  isKnown: boolean;
  name?: string | undefined;
  ws: WebSocket;
}

class ClientStorage extends FileStorage<TypeOf<typeof CLIENT_STORAGE_ROW>> {
  #wss: { [clientId: string]: WebSocket } = {};

  constructor(readonly knownClientStorage: KnownClientStorage) {
    super('./json/ClientStorage', CLIENT_STORAGE_ROW);
  }

  add({ ws, ...client }: Omit<EnhancedClientRow, 'createdAt' | 'isKnown' | 'name' | 'updatedAt'>) {
    super.add(client);

    this.#wss[client.id] = ws;
  }

  row(id: string): EnhancedClientRow | undefined {
    const client = super.row(id);

    if (client) {
      return {
        ...client,
        isKnown: this.knownClientStorage.has(client.id),
        name: this.knownClientStorage.row(client.id)?.name,
        ws: this.#wss[client.id]!,
      };
    }
  }

  rows(): EnhancedClientRow[] {
    return super.rows().map(client => ({
      ...client,
      isKnown: this.knownClientStorage.has(client.id),
      name: this.knownClientStorage.row(client.id)?.name,
      ws: this.#wss[client.id]!,
    }));
  }
}

export default ClientStorage;
