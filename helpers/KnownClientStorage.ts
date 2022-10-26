/*
 * Copyright 2022 Marek Kobida
 */

import FileStorage from './FileStorage';
import { KNOWN_CLIENT_ROW } from '../commandsFromServer';
import type { TypeOf } from '@warden-sk/validation/types';

class KnownClientStorage extends FileStorage<TypeOf<typeof KNOWN_CLIENT_ROW>> {
  constructor() {
    super('./json/KnownClientStorage.json', KNOWN_CLIENT_ROW);
  }
}

export default KnownClientStorage;
