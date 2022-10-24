/*
 * Copyright 2022 Marek Kobida
 */

export function json_decode(input: string): any {
  return JSON.parse(input);
}

export function json_encode(input: any): string {
  return JSON.stringify(input);
}
