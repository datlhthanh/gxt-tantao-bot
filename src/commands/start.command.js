export function startCommand(bot) {
  bot.command('start', (ctx) =>
    ctx.reply(`Chào mày <b>${ctx.from.first_name}</b>!`, { parse_mode: 'HTML' })
  );
}