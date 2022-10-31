/*
 * Copyright 2022 Marek Kobida
 */

export interface Cookie {
  Domain?: string | undefined;
  HttpOnly?: boolean | undefined;
  Path?: string | undefined;
  SameSite?: 'Lax' | 'None' | 'Strict' | undefined;
  Secure?: boolean | undefined;
}

class CookieStorage {
  #cookies: [left: string, right: string, cookie: Cookie][] = [];

  cookies(): string[] {
    return this.#cookies.map(([left, right, cookie]) => {
      let $ = `${left}=${right}`;

      if (cookie.Domain) {
        $ += `; Domain=${cookie.Domain}`;
      }

      if (cookie.HttpOnly) {
        $ += '; HttpOnly';
      }

      if (cookie.Path) {
        $ += `; Path=${cookie.Path}`;
      }

      if (cookie.SameSite) {
        $ += `; SameSite=${cookie.SameSite}`;
      }

      if (cookie.Secure) {
        $ += '; Secure';
      }

      return $;
    });
  }

  readCookies(input: string): { [left: string]: string | undefined } {
    const cookies: { [left: string]: string } = {};
    const pattern = /\s*([^=]+)\s*=\s*([^;]+);?\s*/g;

    let $;
    while (($ = pattern.exec(input)) !== null) {
      const [, left, right] = $;

      if (left && right) {
        cookies[left] = right;
      }
    }

    return cookies;
  }

  writeCookie(left: string, right: string, cookie: Cookie = {}) {
    this.#cookies = [...this.#cookies, [left, right, cookie]];
  }
}

export default CookieStorage;
