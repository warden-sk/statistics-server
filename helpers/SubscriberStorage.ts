/*
 * Copyright 2022 Marek Kobida
 */

import * as t from '@warden-sk/validation';
import FileStorage, { FILE_STORAGE_ROW } from './FileStorage';

class SubscriberStorage extends FileStorage<t.TypeOf<typeof SUBSCRIBER_STORAGE_ROW>> {
  constructor() {
    super('./json/SubscriberStorage.json', SUBSCRIBER_STORAGE_ROW);
  }

  add(row: Omit<t.TypeOf<typeof SUBSCRIBER_STORAGE_ROW>, keyof t.TypeOf<typeof FILE_STORAGE_ROW>>) {
    super.add({ ...row, id: FileStorage.id() });
  }
}

export const SUBSCRIBER_STORAGE_ROW = t.intersection([
  FILE_STORAGE_ROW,
  t.interface({
    'e-mail': t.string(), // dokončiť "pattern"
  }),
]);

export default SubscriberStorage;
