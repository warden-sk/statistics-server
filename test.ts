/*
 * Copyright 2022 Marek Kobida
 */

import fs from 'fs';
import report from './report';
import zlib from 'zlib';

const files = ['./json/ClientStorage.json', './json/HistoryStorage.json', './json/KnownClientStorage.json'];

files.forEach(file => {
  fs.writeFileSync(file, zlib.gzipSync('[]'));

  report(undefined, '[FILE]', file);
});
