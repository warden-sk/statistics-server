/*
 * Copyright 2022 Marek Kobida
 */

export enum ReportType {
  IN = 1,
  OUT = 2,
}

function report(type: ReportType | undefined, ...$: any[]) {
  const date = new Date();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  console.log(type === 1 ? '\x1b[32m↓' : type === 2 ? '\x1b[31m↑' : '→', `[${hours}:${minutes}]\x1b[0m`, ...$);
}

export default report;
