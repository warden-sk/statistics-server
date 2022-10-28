import commandsFromClient from './commandsFromClient';

let rows: string[] = ['# Commands'];

for (const command of commandsFromClient.of) {
  let commandName = command.of[0].name;
  const commandInput = command.of[1].name;

  commandName = commandName.replace(/^"/, '').replace(/"$/, '');

  rows = [...rows, '', `## ${commandName}`, '```json', commandInput, '```', '', '```typescript', command.name, '```'];
}

console.log(rows.join('\n'));
