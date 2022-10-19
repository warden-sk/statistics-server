/*
 * Copyright 2022 Marek Kobida
 */

import type { FileStorageRow } from './FileStorage';
import FileStorage from './FileStorage';

interface History extends FileStorageRow {
  url: string;
}

class HistoryStorage extends FileStorage<History> {}

export default HistoryStorage;
