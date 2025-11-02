import useGetCards, { CardType } from "@/hooks/useGetCards";
import { Dexie, EntityTable } from "dexie";
import useGetCurrentUser, { UserType } from "@/hooks/useGetCurrentUser";

import React, { useCallback, useMemo } from "react";

// ✅ Move this OUTSIDE
const databaseInstances: { [userId: string]: UserSpecificDatabase } = {};
type OfflineOperation = {
  id: string;
  type: "add" | "update" | "delete" | "move" | "batch_delete";
  timestamp: number;
  data: any;
  status: "pending" | "syncing" | "error";
  retryCount: number;
  error?: string;
};

// Create a class for the database to handle user-specific databases
class UserSpecificDatabase extends Dexie {
  cards!: EntityTable<CardType & {}, "_id">;
  offlineOperations!: EntityTable<OfflineOperation, "id">;
  users!: EntityTable<UserType & { lastSync: number }, "_id">;

  constructor(userId: string) {
    if (!userId) {
      throw new Error("Cannot create database with undefined userId");
    }
    super(`collingo_${userId}`);

    this.version(1).stores({
      cards:
        "++IndexId,_id,userId,createdAt,[userId+createdAt],front,back,content,collectionId,stability,difficulty,elapsed_days,scheduled_days,learning_steps,reps,lapses,state,last_review,due",
      offlineOperations: "++id,type,timestamp,status",
      users: "_id,email,username,lastSync",
    });
  }
}

const useDb = (userId: string | undefined) => {
  const getUserDatabase = useCallback(
    (userId: string): UserSpecificDatabase => {
      if (!userId) {
        throw new Error("Cannot get database with undefined userId");
      }
      if (!databaseInstances[userId]) {
        databaseInstances[userId] = new UserSpecificDatabase(userId);
      }
      return databaseInstances[userId];
    },
    []
  );

  const db = useMemo(() => {
    // Try to get userId from localStorage if not provided
    const storedUserId = !userId ? localStorage.getItem("userId") : userId;
    if (!storedUserId) return null;
    return getUserDatabase(storedUserId);
  }, [userId, getUserDatabase]);

  // ✅ All functions wrapped with useCallback
  const getCards = useCallback(async (): Promise<CardType[] | undefined> => {
    if (!userId || !db) return [];
    try {
      const cards = await db.cards
        .where("[userId+createdAt]")
        .between([userId, Dexie.minKey], [userId, Dexie.maxKey])
        .toArray();

      cards.sort((a, b) => {
        //@ts-ignore
        return b.createdAt - a.createdAt;
      });
      return cards;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }, [userId, db]);

  const addCard = useCallback(
    async (card: CardType) => {
      if (!userId || !db) return null;
      return await db.cards.add({
        ...card,
        createdAt: card.createdAt
          ? new Date(card.createdAt).getTime() // ✅ رقم ثابت
          : Date.now(),
        userId,
      });
    },
    [userId, db]
  );
  const updateCard = useCallback(
    async (card: CardType) => {
      if (!userId || !db) return null;
      return await db.cards.where("_id").equals(card._id).modify(card);
    },
    [userId, db]
  );

  const deleteCard = useCallback(
    async (cardId: string) => {
      if (!userId || !db) return null;
      return await db.cards.where("_id").equals(cardId).delete();
    },
    [userId, db]
  );

  // ✅ Clear all cards (used before full sync to prevent duplicates)
  const clearCards = useCallback(async () => {
    console.log("🧹 Dexie cards cleared");

    if (!db) return null;
    return await db.cards.clear();
  }, [userId, db]);

  const batchDeleteCards = useCallback(
    async (cardIds: string[]) => {
      if (!userId || !db) return null;
      return await db.cards.where("_id").anyOf(cardIds).delete();
    },
    [userId, db]
  );

  const addOfflineOperation = useCallback(
    async (operation: Omit<OfflineOperation, "id">) => {
      if (!userId || !db) return null;
      await db.offlineOperations.add({
        ...operation,
        id: Date.now().toString(),
      });
    },
    [userId, db]
  );

  const getOfflineOperations = useCallback(async () => {
    if (!userId || !db) return [];
    const offlineOperations = await db.offlineOperations
      .where("status")
      .equals("pending")
      .toArray();
    return offlineOperations;
  }, [userId, db]);

  const updateOfflineOperation = useCallback(
    async (id: string, updates: Partial<OfflineOperation>) => {
      if (!userId || !db) return null;
      return await db.offlineOperations.update(id, updates);
    },
    [userId, db]
  );

  const deleteOfflineOperation = useCallback(
    async (id: string) => {
      if (!userId || !db) return null;
      return await db.offlineOperations.delete(id);
    },
    [userId, db]
  );

  const handleOfflineOperation = useCallback(
    async (
      type: "add" | "update" | "delete" | "move" | "batch_delete",
      data: any
    ) => {
      if (!userId) return null;

      await addOfflineOperation({
        type,
        timestamp: Date.now(),
        data: data,
        status: "pending",
        retryCount: 0,
      });
    },
    [userId, addOfflineOperation]
  );

  const saveUser = useCallback(
    async (user: UserType) => {
      if (!user?._id) {
        throw new Error("Cannot save user without _id");
      }
      const db = getUserDatabase(user._id);
      // Store user ID in localStorage for offline access
      localStorage.setItem("userId", user._id);
      await db.users.put({ ...user, lastSync: Date.now() });
    },
    [getUserDatabase]
  );

  const getUser = useCallback(async (): Promise<
    (UserType & { lastSync: number }) | undefined
  > => {
    if (!userId || !db) return undefined;
    try {
      return await db.users.get(userId);
    } catch {
      return undefined;
    }
  }, [userId, db]);

  const deleteUser = useCallback(async () => {
    console.log("userId", userId);
    if (!userId) return;

    const dbName = `collingo_${userId}`;

    try {
      // 1️⃣ Close Dexie instance if it exists
      const dbInstance = databaseInstances[userId];
      if (dbInstance) {
        await dbInstance.close();
        delete databaseInstances[userId];
      }

      // 2️⃣ Delete IndexedDB database properly using a Promise
      await new Promise<void>((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase(dbName);

        deleteRequest.onsuccess = () => {
          console.log(`🗑️ Successfully deleted database: ${dbName}`);
          resolve();
        };
        deleteRequest.onerror = (event) => {
          console.error("❌ Error deleting database:", event);
          reject(event);
        };
        deleteRequest.onblocked = () => {
          console.warn(`⚠️ Database deletion blocked for: ${dbName}`);
        };
      });

      // 3️⃣ Remove user-related cached info
      localStorage.removeItem("userId");

      console.log("✅ User data deleted and local storage cleared.");
    } catch (error) {
      console.error("❌ Error deleting user database:", error);
    }
  }, [userId]);

  const bulkAddCards = useCallback(
    async (cards: CardType[]) => {
      if (!userId || !db) return null;

      console.log("bulk adding to bexie db", cards);
      return await db.cards.bulkAdd(
        cards.map((c) => ({
          ...c,
          userId,
          // createdAt:new Date().toJSON()
        }))
      );
    },
    [userId, db]
  );

  const bulkPutCards = useCallback(
    async (cards: CardType[]) => {
      if (!userId || !db || !cards?.length) return null;
      try {
        await db.cards.bulkPut(
          [...cards].map((c) => ({
            ...c,
            userId,
            createdAt: c.createdAt
              ? new Date(c.createdAt).getTime() // ✅ خليها رقم timestamp
              : Date.now(),
          }))
        );
      } catch (err) {
        console.error("❌ bulkPutCards error:", err);
      }
    },
    [userId, db]
  );

  return {
    getCards,
    getUserDatabase,
    addCard,
    updateCard,
    deleteCard,
    batchDeleteCards,
    addOfflineOperation,
    getOfflineOperations,
    updateOfflineOperation,
    deleteOfflineOperation,
    handleOfflineOperation,
    saveUser,
    getUser,
    deleteUser,
    bulkAddCards,
    clearCards,
    bulkPutCards,
  };
};

export default useDb;
