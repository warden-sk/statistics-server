/*
 * Copyright 2022 Marek Kobida
 */

import type { FileStorageRow } from './FileStorage';
import FileStorage from './FileStorage';

export interface History extends FileStorageRow {
  clientId: string;
  url: string;
}

class HistoryStorage extends FileStorage<History> {
  add(row: Omit<History, 'createdAt' | 'id' | 'updatedAt'>) {
    super.add({ ...row, id: (+new Date()).toString() });
  }
}

export default HistoryStorage;
