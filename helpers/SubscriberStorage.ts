/*
 * Copyright 2022 Marek Kobida
 */

import FileStorage, { FILE_STORAGE_ROW } from './FileStorage';
import type { TypeOf } from '@warden-sk/validation/types';

export const SUBSCRIBER_STORAGE_ROW = FILE_STORAGE_ROW;

class SubscriberStorage extends FileStorage<TypeOf<typeof SUBSCRIBER_STORAGE_ROW>> {
  constructor() {
    super('./json/SubscriberStorage.json', SUBSCRIBER_STORAGE_ROW);
  }
}

export default SubscriberStorage;
