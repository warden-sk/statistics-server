/*
 * Copyright 2022 Marek Kobida
 */

import type Type from '@warden-sk/validation/Type';
import type { Either } from '@warden-sk/validation/types';
import { isLeft, left, right } from '@warden-sk/validation/functions';

// private
type T = T[] | boolean | number | string | { [key: string]: T } | null;

export function json_decode(input: string): Either<unknown, T> {
  try {
    return right(JSON.parse(input));
  } catch (error) {
    return left(error);
  }
}

export function json_decode_with_type(input: string, type: Type<any>): Either<unknown, T> {
  try {
    const validation = type.decode(JSON.parse(input));

    if (isLeft(validation)) {
      return left(validation.left);
    }

    return right(validation.right);
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
