import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type MultiplayerState = {
  lobbyID: string | null; // Populated when joining a lobby
  playerID: number | null; // Populated when joining a lobby
  players: string[]; // list of player names in the lobby
  lobbyOpen: boolean;
  gameStarted: boolean;
};

type MultiplayerActions = {
  setGameStarted: (gameStarted: boolean) => void;
  setLobbyID: (lobbyID: string) => void;
  setLobbyOpen: (lobbyOpen: boolean) => void;
  setPlayerID: (playerID: number) => void;
  setPlayers: (players: string[]) => void;
};

export const multiplayerStore = create<MultiplayerState & MultiplayerActions>()(
  subscribeWithSelector(
    immer((set) => ({
      lobbyID: null,
      lobbyOpen: false,
      playerID: 0,
      players: [],
      gameStarted: false,
      turn: 0,
      setLobbyID: (lobbyID: string) =>
        set((state) => {
          state.lobbyID = lobbyID;
        }),
      setLobbyOpen: (lobbyOpen: boolean) =>
        set((state) => {
          state.lobbyOpen = lobbyOpen;
        }),
      setPlayerID: (playerID: number) =>
        set((state) => {
          state.playerID = playerID;
        }),
      setPlayers: (players: string[]) =>
        set((state) => {
          state.players = players;
        }),
      setGameStarted: (gameStarted: boolean) =>
        set((state) => {
          state.gameStarted = gameStarted;
        }),
    })),
  ),
);
