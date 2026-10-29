import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { config } from "../app.config.js";

function loadGroups() {
  try {
    const groups = JSON.parse(
      readFileSync(config.announcementGroupsFile, "utf-8"),
    );
    if (!Array.isArray(groups)) {
      throw new Error("Danh sách group phải là một mảng.");
    }
    return groups;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw new Error(`Không đọc được danh sách group: ${error.message}`, {
      cause: error,
    });
  }
}

let groups = loadGroups();

function saveGroups() {
  mkdirSync(dirname(config.announcementGroupsFile), { recursive: true });
  writeFileSync(
    config.announcementGroupsFile,
    `${JSON.stringify(groups, null, 2)}\n`,
    { mode: 0o600 },
  );
}

export function addAnnouncementGroup(chat) {
  const existing = groups.find((group) => group.id === chat.id);
  const group = {
    id: chat.id,
    title: chat.title || `Group ${chat.id}`,
  };

  if (existing) {
    Object.assign(existing, group);
  } else {
    groups.push(group);
  }
  saveGroups();
  return { group, added: !existing };
}

export function listAnnouncementGroups() {
  return [...groups];
}

export function removeAnnouncementGroup(id) {
  const index = groups.findIndex((group) => group.id === id);
  if (index === -1) return false;
  groups.splice(index, 1);
  saveGroups();
  return true;
}
