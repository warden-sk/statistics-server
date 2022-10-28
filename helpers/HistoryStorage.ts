/*
 * Copyright 2022 Marek Kobida
 */

import * as t from '@warden-sk/validation';
import FileStorage, { FILE_STORAGE_ROW } from './FileStorage';
import type { TypeOf } from '@warden-sk/validation/types';
import { UnionType } from '@warden-sk/validation';

export const HISTORY_STORAGE_ROW = new t.IntersectionType([
  FILE_STORAGE_ROW,
  new t.InterfaceType({
    clientId: new t.StringType(),
    message: new UnionType([new t.StringType(), new t.UndefinedType()]),
    url: new t.StringType(),
  }),
]);

class HistoryStorage extends FileStorage<TypeOf<typeof HISTORY_STORAGE_ROW>> {
  constructor() {
    super('./json/HistoryStorage.json', HISTORY_STORAGE_ROW);
  }

  add(row: Omit<TypeOf<typeof HISTORY_STORAGE_ROW>, keyof TypeOf<typeof FILE_STORAGE_ROW>>) {
    super.add({ ...row, id: FileStorage.id() });
  }
}

export default HistoryStorage;
