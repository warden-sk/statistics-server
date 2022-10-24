/*
 * Copyright 2022 Marek Kobida
 */

import * as fs from 'fs';
import { json_decode, json_encode } from './json';

export interface FileStorageRow {
  createdAt: number;
  id: string;
  updatedAt: number;
}

class FileStorage<Row extends FileStorageRow> {
  readonly $!: string;

  #readFile(): Row[] {
    return json_decode(fs.readFileSync(`./json/${this.$}.json`));
  }

  #writeFile(on: (rows: Row[]) => Row[]) {
    const rows = on(this.#readFile());

    fs.writeFileSync(`./json/${this.$}.json`, json_encode(rows));
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

  update(json: { [K in keyof Row]?: Row[K] }) {
    this.#writeFile(rows =>
      rows.map(row => {
        if (row.id === json.id) {
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
