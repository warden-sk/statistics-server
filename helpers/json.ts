/*
 * Copyright 2022 Marek Kobida
 */

import type { Either } from '@warden-sk/validation/types';
import { left, right } from '@warden-sk/validation/functions';

// private
type T = T[] | boolean | number | string | { [key: string]: T } | null;

export function json_decode(input: Buffer | string): Either<unknown, T> {
  try {
    return right(JSON.parse(input.toString()));
  } catch (error) {
    return left(error);
  }
}

export function json_encode<I>(input: I): Either<unknown, string> {
  try {
    return right(JSON.stringify(input));
  } catch (error) {
    return left(error);
  }
}
