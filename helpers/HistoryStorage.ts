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
  readonly $: 'HistoryStorage' = 'HistoryStorage';

  add(row: Omit<History, 'createdAt' | 'id' | 'updatedAt'>) {
    super.add({ ...row, id: FileStorage.id() });
  }
}

export default HistoryStorage;
