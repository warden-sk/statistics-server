/*
 * Copyright 2022 Marek Kobida
 */

import type { WebSocket } from 'ws';
import type { FileStorageRow } from './FileStorage';
import FileStorage from './FileStorage';

export interface Client extends FileStorageRow {
  url: string;
  ws: WebSocket;
}

class ClientStorage extends FileStorage<Client> {}

export default ClientStorage;
