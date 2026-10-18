import { startCommand } from './start.command.js';

export function registerCommands(bot) {
  startCommand(bot);
}