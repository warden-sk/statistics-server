/*
 * Copyright 2022 Marek Kobida
 */

export function json_decode(input: Buffer | string): any {
  return JSON.parse(input.toString());
}

export function json_encode(input: any): string {
  return JSON.stringify(input);
}
