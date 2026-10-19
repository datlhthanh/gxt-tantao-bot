import { startCommand } from './start.command.js';
import { updateTokenCommand } from './update-token.command.js';

export function registerCommands(bot) {
  startCommand(bot);
  updateTokenCommand(bot);
}