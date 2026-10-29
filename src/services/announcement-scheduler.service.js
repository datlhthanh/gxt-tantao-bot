import { listAnnouncementGroups } from "./announcement-group.service.js";

const ANNOUNCEMENTS = {
  "13:00":
    '🌤 Chúc các anh "Team System Xử Lý Ngoại Lệ Tân Tạo" có 1 ngày làm việc hiệu quả và tràn đầy năng lượng 💪',
  "23:00":
    "❤️ Cảm ơn các anh đã làm việc cố gắng và chăm chỉ hôm nay ❤️\n🌙  Chúc các anh ngủ ngon 🌙",
};

const TIME_ZONE = "Asia/Ho_Chi_Minh";
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "numeric",
  minute: "numeric",
  hour12: false,
});

function getVietnamTime() {
  const parts = Object.fromEntries(
    dateFormatter
      .formatToParts(new Date())
      .map((part) => [part.type, part.value]),
  );
  const time = `${parts.hour.padStart(2, "0")}:${parts.minute.padStart(2, "0")}`;
  return {
    time,
    key: `${parts.year}-${parts.month}-${parts.day}-${time}`,
  };
}

async function sendAnnouncement(bot, time, message) {
  if (!message) return;

  for (const group of listAnnouncementGroups()) {
    try {
      await bot.api.sendMessage(group.id, message);
    } catch (error) {
      console.error(
        `Error sending ${time} announcement to ${group.id}:`,
        error,
      );
    }
  }
}

export function startAnnouncementScheduler(bot) {
  let lastSent = null;

  const tick = async () => {
    const { time, key } = getVietnamTime();
    const message = ANNOUNCEMENTS[time];
    if (message && lastSent !== key) {
      lastSent = key;
      await sendAnnouncement(bot, time, message);
    }
  };

  const safeTick = () =>
    tick().catch((error) =>
      console.error("Announcement scheduler error:", error),
    );
  safeTick();
  setInterval(safeTick, 30 * 1000).unref();
}
