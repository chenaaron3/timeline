import { toast } from 'sonner';
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
    const { joinedLobby } = useMultiplayer(lobbyID, playerID);

    const lobbyLink = BASE_URL + lobbyID

    function handleCopyClipboard() {
        navigator.clipboard.writeText(lobbyLink).then(() => {
            toast.success("Copied to clipboard!");
        }).catch((err) => {
            toast.error("Cannot copy to clipboard!");
        });
    }

    return (
        <Dialog open={lobbyOpen} onOpenChange={setLobbyOpen}>
            <DialogContent>
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