/*
 * Copyright 2022 Marek Kobida
 */

import * as t from '@warden-sk/validation';
import FileStorage, { FILE_STORAGE_ROW } from './FileStorage';

class HistoryStorage extends FileStorage<t.TypeOf<typeof HISTORY_STORAGE_ROW>> {
  constructor() {
    super('./json/HistoryStorage.json', HISTORY_STORAGE_ROW);
  }

  add(row: Omit<t.TypeOf<typeof HISTORY_STORAGE_ROW>, keyof t.TypeOf<typeof FILE_STORAGE_ROW>>) {
    super.add({ ...row, id: FileStorage.id() });
  }
}

export const HISTORY_STORAGE_ROW = t.intersection([
  FILE_STORAGE_ROW,
  t.interface({
    clientId: t.string({ pattern: FileStorage.idPattern() }),
    message: t.union([t.string(), t.undefined]), // dokončiť "pattern"
    url: t.union([t.string(), t.undefined]), // dokončiť "pattern"
    windowId: t.string({ pattern: FileStorage.idPattern() }),
  }),
]);

export default HistoryStorage;
