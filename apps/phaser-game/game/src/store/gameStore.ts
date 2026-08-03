import { createStore } from 'zustand/vanilla';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

// Define the shape of our server-provided state
export interface GameStateData {
  playerScore: number;
  currentLevel: number;
  inventory: string[];
  isServerConnected: boolean;
  todos: any[]; // <--- ADDED TODOS
  // Add other server-driven state fields here
}

interface GameStore extends GameStateData {
  setServerState: (data: Partial<GameStateData>) => void;
  setConnectionStatus: (isConnected: boolean) => void;
  
  // Example of an optimistic action
  optimisticScoreUpdate: (points: number) => void;
}

export const useGameStore = createStore<GameStore>()(
  devtools(
    persist(
      (set) => ({
        playerScore: 0,
        currentLevel: 1,
        inventory: [],
        todos: [], // <--- INITIALIZED TODOS
        isServerConnected: false,

        // Directly apply full or partial state updates from the server
        setServerState: (data) => set((state) => ({ ...state, ...data })),

        setConnectionStatus: (isConnected) => set({ isServerConnected: isConnected }),

        // Example action to predict server behavior before confirmation
        optimisticScoreUpdate: (points) => set((state) => ({ playerScore: state.playerScore + points })),
      }),
      {
        name: 'phaser-game-storage', // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => localStorage),
        // We don't want to persist connection status as it's session-based
        partialize: (state) => ({
          playerScore: state.playerScore,
          currentLevel: state.currentLevel,
          inventory: state.inventory,
          todos: state.todos, // <--- PERSIST TODOS
        }),
      }
    ),
    { name: 'PhaserGameState' }
  )
);
