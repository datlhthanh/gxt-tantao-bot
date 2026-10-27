export function startCommand(bot) {
  bot.command("start", (ctx) =>
    ctx.reply(`Hế lô fen <b>${ctx.from.first_name}</b>!`, {
      parse_mode: "HTML",
    }),
  );
}
