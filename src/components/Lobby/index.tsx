import { Dialog, DialogContent } from '~/components/ui/dialog';
import { useMultiplayerStore } from '~/state';

import { LobbyEntrance } from './LobbyEntrance';
import { WaitingRoom } from './WaitingRoom';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL! + "?lobby="

export const Lobby = () => {
    // Global State
    const lobbyOpen = useMultiplayerStore.use.lobbyOpen();
    const joinedLobby = useMultiplayerStore.use.joinedLobby();

    const setLobbyOpen = useMultiplayerStore.use.setLobbyOpen();

    return (
        <Dialog open={lobbyOpen} onOpenChange={setLobbyOpen}>
            <DialogContent onOpenAutoFocus={e => e.preventDefault()}>
                {
                    !joinedLobby && <LobbyEntrance />
                }
                {
                    joinedLobby && <WaitingRoom />
                }
            </DialogContent>
        </Dialog>
    );
}