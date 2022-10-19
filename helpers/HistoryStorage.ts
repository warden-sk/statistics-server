/*
 * Copyright 2022 Marek Kobida
 */

import type { FileStorageRow } from './FileStorage';
import FileStorage from './FileStorage';

export interface History extends FileStorageRow {
  clientAddress: string;
  clientId: string;
  url: string;
}

class HistoryStorage extends FileStorage<History> {}

export default HistoryStorage;
