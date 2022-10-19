/*
 * Copyright 2022 Marek Kobida
 */

import type { FileStorageRow } from './FileStorage';
import FileStorage from './FileStorage';

export interface KnownClient extends FileStorageRow {
  name: string;
}

class KnownClientStorage extends FileStorage<KnownClient> {
  constructor() {
    super();

    this.add({ id: '1666188291859', name: 'Marek Kobida' });
  }
}

export default KnownClientStorage;
