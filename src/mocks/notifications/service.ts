import { database } from "../core/database";
import { snapshot, simulateLatency } from "../core/response";

export const addNotification = (title: string, link: string) =>
  database.notifications.unshift({
    id: crypto.randomUUID(),
    title,
    link,
    at: Date.now(),
  });

async function getNotifications() {
  await simulateLatency();
  return snapshot(database.notifications);
}

export const mockNotificationsService = { getNotifications };
