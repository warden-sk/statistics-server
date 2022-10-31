/*
 * Copyright 2022 Marek Kobida
 */

import commandsFromClient from './commandsFromClient';

let rows: string[] = ['# Commands'];

for (const command of commandsFromClient.of) {
  let commandName = command.of[0].name;
  commandName = commandName.replace(/^"/, '').replace(/"$/, '');

  rows = [...rows, '', `## ${commandName}`, '```typescript', `type T = ${command.name};`, '```'];
}

console.log(rows.join('\n'));
