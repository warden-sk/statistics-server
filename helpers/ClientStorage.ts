/*
 * Copyright 2022 Marek Kobida
 */

import type { FileStorageRow } from './FileStorage';
import FileStorage from './FileStorage';
import type KnownClientStorage from './KnownClientStorage';
import type { WebSocket } from 'ws';

export interface Client extends FileStorageRow {
  url: string;
}

export interface EnhancedClient extends Client {
  isKnown: boolean;
  name?: string | undefined;
  ws: WebSocket;
}

class ClientStorage extends FileStorage<Client> {
  readonly $: 'ClientStorage' = 'ClientStorage';

  #wss: { [clientId: string]: WebSocket } = {};

  constructor(readonly knownClientStorage: KnownClientStorage) {
    super();
  }

  add({ ws, ...client }: Omit<EnhancedClient, 'createdAt' | 'isKnown' | 'updatedAt'>) {
    super.add(client);

    this.#wss[client.id] = ws;
  }

  row(id: string): EnhancedClient | undefined {
    const client = super.row(id);

    if (client) {
      return {
        ...client,
        isKnown: this.knownClientStorage.has(client.id),
        name: this.knownClientStorage.row(client.id)?.name,
        ws: this.#wss[client.id],
      };
    }
  }

  rows(): EnhancedClient[] {
    return super.rows().map(client => ({
      ...client,
      isKnown: this.knownClientStorage.has(client.id),
      name: this.knownClientStorage.row(client.id)?.name,
      ws: this.#wss[client.id],
    }));
  }
}

export default ClientStorage;
