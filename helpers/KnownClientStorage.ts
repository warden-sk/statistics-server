/*
 * Copyright 2023 Marek Kobida
 */

import * as t from '@warden-sk/validation';
import FileStorage, { FILE_STORAGE_ROW } from './FileStorage';

class KnownClientStorage extends FileStorage<t.TypeOf<typeof KNOWN_CLIENT_STORAGE_ROW>> {
  constructor() {
    super('./json/KnownClientStorage.json', KNOWN_CLIENT_STORAGE_ROW);
  }
}

export const KNOWN_CLIENT_STORAGE_ROW = t.intersection([
  FILE_STORAGE_ROW,
  t.interface({
    name: t.string(), // dokončiť "pattern"
  }),
]);

export default KnownClientStorage;
