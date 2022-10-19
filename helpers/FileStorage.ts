/*
 * Copyright 2022 Marek Kobida
 */

export interface FileStorageRow {
  createdAt: number;
  id: string;
  updatedAt: number;
}

class FileStorage<Row extends FileStorageRow> {
  #rows: Row[] = [];

  add(row: Omit<Row, 'createdAt' | 'updatedAt'>) {
    if (!this.has(row.id)) {
      this.#rows = [...this.#rows, { createdAt: +new Date(), updatedAt: +new Date(), ...row } as Row];
    }
  }

  delete(id: string): Row[] {
    return (this.#rows = this.#rows.filter(row => row.id !== id));
  }

  has(id: string): boolean {
    return this.#rows.findIndex(row => row.id === id) !== -1;
  }

  row(id: string): Row | undefined {
    const i = this.#rows.findIndex(row => row.id === id);

    return i === -1 ? undefined : this.#rows[i];
  }

  rows(): Row[] {
    return this.#rows;
  }

  size(): number {
    return this.#rows.length;
  }

  update(json: { [K in keyof Row]?: Row[K] }): Row[] {
    return (this.#rows = this.#rows.map(row => {
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
    }));
  }
}

export default FileStorage;
