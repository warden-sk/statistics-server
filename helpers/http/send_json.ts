/*
 * Copyright 2022 Marek Kobida
 */

import { chainW, right } from '@warden-sk/validation/Either';
import type { Either } from '@warden-sk/validation/Either';
import { json_encode } from '@warden-sk/validation/json';
import pipe from '@warden-sk/validation/pipe';
import type stream from 'stream';

function send_json($: stream.Writable): (json: Parameters<typeof json_encode>[0]) => Either<unknown, stream.Writable> {
  return json =>
    pipe(
      json,
      json_encode,
      chainW(json => right($.end(json)))
    );
}

export default send_json;
