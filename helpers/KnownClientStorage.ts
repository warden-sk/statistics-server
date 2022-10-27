/*
 * Copyright 2022 Marek Kobida
 */

import FileStorage, { FILE_STORAGE_ROW } from './FileStorage';
import type { TypeOf } from '@warden-sk/validation/types';
import * as t from '@warden-sk/validation';

export const KNOWN_CLIENT_STORAGE_ROW = new t.IntersectionType([
  FILE_STORAGE_ROW,
  new t.InterfaceType({
    name: new t.StringType(),
  }),
]);

class KnownClientStorage extends FileStorage<TypeOf<typeof KNOWN_CLIENT_STORAGE_ROW>> {
  constructor() {
    super('./json/KnownClientStorage.json', KNOWN_CLIENT_STORAGE_ROW);
  }
}

export default KnownClientStorage;
