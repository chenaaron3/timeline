import { Dialog, DialogContent } from '~/components/ui/dialog';
import { useMultiplayer } from '~/hooks/useMultiplayer';
import { useMultiplayerStore } from '~/state';

import { LobbyEntrance } from './LobbyEntrance';
import { WaitingRoom } from './WaitingRoom';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL! + "?lobby="

export const Lobby = () => {
    // Global State
    const lobbyOpen = useMultiplayerStore.use.lobbyOpen();
    const lobbyID = useMultiplayerStore.use.lobbyID();
    const playerID = useMultiplayerStore.use.playerID();
    const setLobbyOpen = useMultiplayerStore.use.setLobbyOpen();

    // Custom Hooks
    const { players, joinedLobby, startGame } = useMultiplayer(lobbyID, playerID);

    return (
        <Dialog open={lobbyOpen} onOpenChange={setLobbyOpen}>
            <DialogContent>
                {
                    !joinedLobby && <LobbyEntrance />
                }
                {
                    joinedLobby && <WaitingRoom players={players!} startGame={startGame} />
                }
            </DialogContent>
        </Dialog>
    );
}