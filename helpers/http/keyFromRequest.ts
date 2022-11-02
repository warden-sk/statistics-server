/*
 * Copyright 2022 Marek Kobida
 */

import CookieStorage from '../CookieStorage';
import FileStorage from '../FileStorage';
import type http from 'http';

const COOKIE_NAME = 'key';

function keyFromRequest(request: http.IncomingMessage, response: http.ServerResponse): string {
  const cookieStorage = new CookieStorage();

  const cookies = cookieStorage.readCookies(request.headers.cookie ?? '');

  if (FileStorage.isValidId(cookies[COOKIE_NAME])) {
    // cookie exists

    return cookies[COOKIE_NAME];
  } else {
    // cookie does not exist

    const key = FileStorage.id();

    cookieStorage.writeCookie(COOKIE_NAME, key, { HttpOnly: true });

    response.setHeader('Set-Cookie', cookieStorage.cookies());

    return key;
  }
}

export default keyFromRequest;
