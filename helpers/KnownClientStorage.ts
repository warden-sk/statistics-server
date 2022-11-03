/*
 * Copyright 2022 Marek Kobida
 */

import * as t from '@warden-sk/validation';
import FileStorage, { FILE_STORAGE_ROW } from './FileStorage';

class KnownClientStorage extends FileStorage<t.TypeOf<typeof KNOWN_CLIENT_STORAGE_ROW>> {
  constructor() {
    super('./json/KnownClientStorage.json', KNOWN_CLIENT_STORAGE_ROW);
  }
}

export const KNOWN_CLIENT_STORAGE_ROW = new t.IntersectionType([
  FILE_STORAGE_ROW,
  new t.InterfaceType({
    name: new t.StringType(), // dokončiť "pattern"
  }),
]);

export default KnownClientStorage;
