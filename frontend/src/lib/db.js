import Dexie from "dexie";

export const db = new Dexie("nutriKosh");

db.version(1).stores({
  foodEntries: "++localId, userId, date, syncStatus",
  weightEntries: "++localId, userId, date, syncStatus",
  myFoods: "++localId, userId",
});

// Initialize local ID counter
let localIdCounter = 0;

export function generateLocalId() {
  return `local-${Date.now()}-${++localIdCounter}`;
}

export async function addFoodEntry(entry) {
  const localId = generateLocalId();
  await db.foodEntries.add({
    localId,
    syncStatus: "pending",
    ...entry,
  });
  return localId;
}

export async function addWeightEntry(entry) {
  const localId = generateLocalId();
  await db.weightEntries.add({
    localId,
    syncStatus: "pending",
    ...entry,
  });
  return localId;
}

export async function getPendingEntries() {
  const foodEntries = await db.foodEntries.where("syncStatus").equals("pending").toArray();
  const weightEntries = await db.weightEntries
    .where("syncStatus")
    .equals("pending")
    .toArray();
  return { foodEntries, weightEntries };
}

export async function markEntrySynced(table, localId) {
  if (table === "foodEntries") {
    await db.foodEntries.update(localId, { syncStatus: "synced" });
  } else if (table === "weightEntries") {
    await db.weightEntries.update(localId, { syncStatus: "synced" });
  }
}

export async function deleteFoodEntry(localId) {
  await db.foodEntries.delete(localId);
}

export async function deleteWeightEntry(localId) {
  await db.weightEntries.delete(localId);
}

export async function getTodayFoodEntries(userId, date) {
  return db.foodEntries
    .where({ userId, date })
    .toArray();
}

export async function getWeightEntries(userId) {
  return db.weightEntries
    .where("userId")
    .equals(userId)
    .reverse()
    .toArray();
}

export async function clearUserData(userId) {
  await db.foodEntries.where("userId").equals(userId).delete();
  await db.weightEntries.where("userId").equals(userId).delete();
}

export async function getFoodEntriesByDate(userId, date) {
  return db.foodEntries.where({ userId, date }).toArray();
}

export async function getWeightEntriesByDateRange(userId, startDate, endDate) {
  return db.weightEntries
    .where("userId")
    .equals(userId)
    .filter((e) => e.date >= startDate && e.date <= endDate)
    .reverse()
    .toArray();
}

export async function mergeServerFoodEntries(userId, serverEntries) {
  const localEntries = await db.foodEntries.where("userId").equals(userId).toArray();

  for (const serverEntry of serverEntries) {
    const localEntry = localEntries.find((e) => e._id === serverEntry._id);
    if (!localEntry) {
      // New entry from server
      await db.foodEntries.add({
        ...serverEntry,
        syncStatus: "synced",
      });
    } else if (new Date(serverEntry.createdAt) > new Date(localEntry.createdAt)) {
      // Server version is newer
      await db.foodEntries.update(localEntry.localId, {
        ...serverEntry,
        syncStatus: "synced",
      });
    }
  }
}

export async function mergeServerWeightEntries(userId, serverEntries) {
  const localEntries = await db.weightEntries.where("userId").equals(userId).toArray();

  for (const serverEntry of serverEntries) {
    const localEntry = localEntries.find((e) => e._id === serverEntry._id);
    if (!localEntry) {
      // New entry from server
      await db.weightEntries.add({
        ...serverEntry,
        syncStatus: "synced",
      });
    } else if (new Date(serverEntry.createdAt) > new Date(localEntry.createdAt)) {
      // Server version is newer
      await db.weightEntries.update(localEntry.localId, {
        ...serverEntry,
        syncStatus: "synced",
      });
    }
  }
}
