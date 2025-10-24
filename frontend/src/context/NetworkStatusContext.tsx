import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import useDb from "@/db/useDb";
import axios from "axios";
import useToasts from "@/hooks/useToasts";
import useGetCurrentUser from "../hooks/useGetCurrentUser";

interface NetworkContextType {
  isOnline: boolean;
  syncPendingOperations: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  syncPendingOperations: async () => {},
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { addToast } = useToasts();
  const { user } = useGetCurrentUser();

  const {
    getOfflineOperations,
    updateOfflineOperation,
    deleteOfflineOperation,
  } = useDb(user?._id);
  const syncPendingOperations = useCallback(async () => {
    if (!isOnline) return;

    const pendingOperations = await getOfflineOperations();

    if (pendingOperations.length === 0) return;

    const toast = addToast("Syncing offline changes...", "promise");

    for (const operation of pendingOperations) {
      try {
        await updateOfflineOperation(operation.id, { status: "syncing" });

        switch (operation.type) {
          case "add":
            // Send all SRS fields for new cards
            await axios.post("/card", {
              ...operation.data,
              stability: operation.data.stability,
              difficulty: operation.data.difficulty,
              elapsed_days: operation.data.elapsed_days,
              scheduled_days: operation.data.scheduled_days,
              learning_steps: operation.data.learning_steps,
              reps: operation.data.reps,
              lapses: operation.data.lapses,
              state: operation.data.state,
              last_review: operation.data.last_review,
              due: operation.data.due
            });
            break;
          case "update":
            // Send all SRS fields for card updates
            await axios.patch(`/card/${operation.data._id}`, {
              ...operation.data,
              stability: operation.data.stability,
              difficulty: operation.data.difficulty,
              elapsed_days: operation.data.elapsed_days,
              scheduled_days: operation.data.scheduled_days,
              learning_steps: operation.data.learning_steps,
              reps: operation.data.reps,
              lapses: operation.data.lapses,
              state: operation.data.state,
              last_review: operation.data.last_review,
              due: operation.data.due
            });
            break;
          case "delete":
            await axios.delete(`/card/${operation.data._id}`);
            break;
          case "batch_delete":
            await axios.post(`/card/batch-delete`, operation.data);
            break;
          case "move":
            await axios.post("/card/batch-move", operation.data);
            break;
        }

        await deleteOfflineOperation(operation.id);
      } catch (error) {
        console.error("Error syncing operation:", error);
        await updateOfflineOperation(operation.id, {
          status: "error",
          error: error.message,
          retryCount: (operation.retryCount || 0) + 1,
        });
      }
    }

    toast.setToastData({
      title: "Offline changes synced successfully!",
      type: "success",
    });
  }, [user, isOnline]);
  useEffect(() => {
    if (user?._id && isOnline) {
      syncPendingOperations();
    }

    const handleOnline = () => {
      setIsOnline(true);
      if (user?._id) syncPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user?._id, isOnline, syncPendingOperations]);

  return (
    <NetworkContext.Provider value={{ isOnline, syncPendingOperations }}>
      {children}
    </NetworkContext.Provider>
  );
};
