/*
 * Copyright 2022 Marek Kobida
 */

import report, { ReportType } from '../report';

export interface FileStorageRow {
  createdAt: number;
  id: string;
  updatedAt: number;
}

class FileStorage<Row extends FileStorageRow> {
  #rows: Row[] = [];

  add(row: Omit<Row, 'createdAt' | 'updatedAt'>) {
    if (!this.has(row.id)) {
      report(ReportType.IN, '[FileStorage.add]', `"${row.id}"`);

      this.#rows = [...this.#rows, { createdAt: +new Date(), updatedAt: +new Date(), ...row } as Row];
    }
  }

  #delete(id: string) {
    this.#rows = this.#rows.filter(row => row.id !== id);
  }

  has(id: string): boolean {
    return this.#rows.findIndex(row => row.id === id) !== -1;
  }

  row(id: string): Row | undefined {
    const i = this.#rows.findIndex(row => row.id === id);

    if (i !== -1) {
      const row = this.#rows[i];

      report(ReportType.OUT, '[FileStorage.row]', `"${row.id}"`);

      return row;
    }
  }

  rows(): Row[] {
    return this.#rows;
  }

  update(json: { [K in keyof Row]?: Row[K] }) {
    this.#rows = this.#rows.map(row => {
      if (row.id === json.id) {
        report(ReportType.IN, '[FileStorage.update]', `"${row.id}"`);

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
    });
  }
}

export default FileStorage;
