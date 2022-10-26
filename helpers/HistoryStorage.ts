/*
 * Copyright 2022 Marek Kobida
 */

import FileStorage from './FileStorage';
import { HISTORY_STORAGE_ROW } from '../commandsFromServer';
import type { TypeOf } from '@warden-sk/validation/types';

class HistoryStorage extends FileStorage<TypeOf<typeof HISTORY_STORAGE_ROW>> {
  constructor() {
    super('HistoryStorage', HISTORY_STORAGE_ROW);
  }

  add(row: Omit<TypeOf<typeof HISTORY_STORAGE_ROW>, 'createdAt' | 'id' | 'updatedAt'>) {
    super.add({ ...row, id: FileStorage.id() });
  }
}

export default HistoryStorage;
