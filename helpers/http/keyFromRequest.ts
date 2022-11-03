/*
 * Copyright 2022 Marek Kobida
 */

import CookieStorage from '../CookieStorage';
import FileStorage from '../FileStorage';

function keyFromRequest(i: Headers, o: Headers, cookieName = 'key'): string {
  const cookieStorage = new CookieStorage();

  // cookie exists
  const cookies = cookieStorage.readCookies(i.get('Cookie') ?? '');
  const cookie = cookies[cookieName];

  if (FileStorage.isValidId(cookie)) {
    return cookie;
  }

  // cookie does not exist
  const key = FileStorage.id();

  cookieStorage.writeCookie(cookieName, key, { HttpOnly: true });

  cookieStorage.cookies().forEach(cookie => o.append('Set-Cookie', cookie));

  return key;
}

export default keyFromRequest;
