/*
 * Copyright 2022 Marek Kobida
 */

import type { Either } from '@warden-sk/validation/types';
import { tryCatch } from '@warden-sk/validation/functions';

// private
type T = T[] | boolean | number | string | { [key: string]: T } | null;

export function json_decode(input: string): Either<unknown, T> {
  return tryCatch(
    () => JSON.parse(input),
    <E>(e: E): E => e
  );
}

export function json_encode<I>(input: I): Either<unknown, string> {
  return tryCatch(
    () => JSON.stringify(input),
    <E>(e: E): E => e
  );
}
