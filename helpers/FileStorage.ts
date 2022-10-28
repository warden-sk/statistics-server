/*
 * Copyright 2022 Marek Kobida
 */

import fs from 'fs';
import crypto from 'crypto';
import type Type from '@warden-sk/validation/Type';
import { isRight } from '@warden-sk/validation/Either';
import { json_decode, json_encode } from '@warden-sk/validation/json';
import type { TypeOf } from '@warden-sk/validation/types';
import * as t from '@warden-sk/validation';
import zlib from 'zlib';

export const FILE_STORAGE_ROW = new t.InterfaceType({
  createdAt: new t.NumberType(),
  id: new t.StringType(),
  updatedAt: new t.NumberType(),
});

class FileStorage<Row extends TypeOf<typeof FILE_STORAGE_ROW>> {
  constructor(readonly filePath: string, readonly type: Type<Row>) {}

  #readFile(): Row[] {
    const $ =
      process.env.NODE_ENV === 'development'
        ? fs.readFileSync(this.filePath)
        : zlib.gunzipSync(fs.readFileSync(this.filePath));

    const decoded = json_decode($.toString());

    if (isRight(decoded)) {
      const validation = new t.ArrayType(this.type).decode(decoded.right);

      if (isRight(validation)) {
        return validation.right;
      }
    }

    throw new Error('The file is not valid.');
  }

  #writeFile(on: (rows: Row[]) => Row[]) {
    const rows = on(this.#readFile());

    const encoded = json_encode(rows);

    if (isRight(encoded)) {
      const $ = process.env.NODE_ENV === 'development' ? encoded.right : zlib.gzipSync(encoded.right);

      fs.writeFileSync(this.filePath, $);
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  add(row: Omit<Row, 'createdAt' | 'updatedAt'>) {
    if (!this.has(row.id)) {
      this.#writeFile(rows => [...rows, { createdAt: +new Date(), updatedAt: +new Date(), ...row } as Row]);
    }
  }

  has(id: string): boolean {
    return this.#readFile().findIndex(row => row.id === id) !== -1;
  }

  static id(): string {
    return crypto.randomUUID();
  }

  static isValidId(id?: string | undefined): id is string {
    return typeof id === 'string' && /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/.test(id);
  }

  row(id: string): Row | undefined {
    const rows = this.#readFile();

    const i = rows.findIndex(row => row.id === id);

    if (i !== -1) {
      return rows[i];
    }
  }

  rows(): Row[] {
    return this.#readFile();
  }

  update(id: string, json: { [K in keyof Row]?: Row[K] | undefined }) {
    this.#writeFile(rows =>
      rows.map(row => {
        if (row.id === id) {
          return {
            ...row,
            ...json,
            // not updated
            createdAt: row.createdAt,
            id: row.id,
            updatedAt: +new Date(),
          };
        }

        return row;
      })
    );
  }
}

export default FileStorage;
