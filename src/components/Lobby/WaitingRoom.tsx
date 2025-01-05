import { ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';
import { useMultiplayer } from '~/hooks/useMultiplayer';
import { useMultiplayerStore } from '~/state';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL! + "?lobby="

export const WaitingRoom = () => {
    // Global State
    const lobbyID = useMultiplayerStore.use.lobbyID();
    const playerID = useMultiplayerStore.use.playerID();

    // Custom Hooks
    const { players, joinedLobby } = useMultiplayer(lobbyID, playerID);

    const lobbyLink = BASE_URL + lobbyID

    function handleCopyClipboard() {
        navigator.clipboard.writeText(lobbyLink).then(() => {
            toast.success("Copied to clipboard!");
        }).catch((err) => {
            toast.error("Cannot copy to clipboard!");
        });
    }

    return <div>
        <DialogHeader>
            <DialogTitle>
                <span className='text-3xl sm:text-4xl'>Lobby</span>
            </DialogTitle>
            <DialogDescription>
            </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-3 max-w-sm'>
            {
                (players && players.length > 0) && <div>
                    <div className='flex justify-evenly items-center flex-wrap'>
                        {
                            players.map(p => <Badge className='animate-pulse text-lg sm:text-xl' variant="secondary">
                                {p}
                            </Badge>
                            )
                        }
                    </div>
                </div>
            }
            {
                (players == undefined || players.length == 0) && <div>
                    Waiting for players to join...
                </div>
            }
            <div className="flex items-center w-full max-w-sm space-x-2">
                <Button variant="outline" onClick={() => handleCopyClipboard()}>
                    <ClipboardCopy />
                </Button>
                <Input className='sm:min-w-64' type="text" value={lobbyLink} />
            </div>
            <div className="text-sm">
                <p>Share this link with your friends</p>
            </div>
            <Button disabled={playerID != 1} type="button">Start Game</Button>
        </div>
    </div>

}