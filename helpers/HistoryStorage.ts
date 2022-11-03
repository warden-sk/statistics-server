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

export const HISTORY_STORAGE_ROW = new t.IntersectionType([
  FILE_STORAGE_ROW,
  new t.InterfaceType({
    clientId: new t.StringType({ pattern: FileStorage.idPattern() }),
    message: new t.UnionType([new t.StringType(), new t.UndefinedType()]), // dokončiť "pattern"
    url: new t.UnionType([new t.StringType(), new t.UndefinedType()]), // dokončiť "pattern"
    windowId: new t.StringType({ pattern: FileStorage.idPattern() }),
  }),
]);

export default HistoryStorage;
