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
    if (!userId) return null;
    return getUserDatabase(userId);
  }, [userId, getUserDatabase]);

  // ✅ All functions wrapped with useCallback
  const getCards = useCallback(async (): Promise<CardType[] | undefined> => {
    if (!userId || !db) return [];
    try {
      const cards = await db.cards
        .where("[userId+createdAt]")
        .between([userId, Dexie.minKey], [userId, Dexie.maxKey])
        .reverse()
        .toArray();
      console.log("cards", cards);
      return cards;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }, [userId, db]);

  const addCard = useCallback(
    async (card: CardType) => {
      if (!userId || !db) return null;
      return await db.cards.add({ ...card, userId, createdAt: Date.now() });
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
    console.log("offlineOperations", offlineOperations);
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
    async (type: "add" | "update" | "delete" | "move" | "batch_delete", data: any) => {
      if (!userId) return null;
      await addOfflineOperation({
        type,
        timestamp: Date.now(),
        data,
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
    if (!userId || !db) return;
    await db.delete();
    delete databaseInstances[userId];
    localStorage.removeItem("userId");

    const databases = await indexedDB.databases();
    for (const database of databases) {
      if (database.name?.startsWith(`collingo_${userId}`)) {
        await indexedDB.deleteDatabase(database.name);
      }
    }
  }, [userId, db]);

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
  };
};

export default useDb;
