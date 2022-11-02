/*
 * Copyright 2022 Marek Kobida
 */

import CookieStorage from '../CookieStorage';
import FileStorage from '../FileStorage';
import type http from 'http';

function keyFromRequest(request: Headers, response: http.ServerResponse, cookieName = 'key'): string {
  const cookieStorage = new CookieStorage();

  const cookies = cookieStorage.readCookies(request.get('Cookie') ?? '');

  // cookie exists
  const cookie = cookies[cookieName];

  if (FileStorage.isValidId(cookie)) {
    return cookie;
  }

  // cookie does not exist
  const key = FileStorage.id();

  cookieStorage.writeCookie(cookieName, key, { HttpOnly: true });

  response.setHeader('Set-Cookie', cookieStorage.cookies());

  return key;
}

export default keyFromRequest;
