import { ClipboardCopy } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '~/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '~/components/ui/form';
import { useGameStore } from '~/state';
import { api } from '~/utils/api';
import { generateUniqueID } from '~/utils/utils';

import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

const formSchema = z.object({
    displayName: z.string().min(2).max(26),
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL! + "?lobby="

export const Lobby = () => {
    // APIS
    const createLobby = api.multiplayer.createLobby.useMutation();

    // Global State
    const lobbyOpen = useGameStore.use.lobbyOpen();
    const seed = useGameStore.use.seed();
    const deckName = useGameStore.use.deckName();
    const deckSize = useGameStore.use.deckSize();
    const setLobbyOpen = useGameStore.use.setLobbyOpen();

    // Local State
    const [lobbyCreated, setLobbyCreated] = useState(false);
    const [lobbyID, setLobbyID] = useState<string>(generateUniqueID());

    const lobbyLink = BASE_URL + lobbyID

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            displayName: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        createLobby.mutate({
            lobbyID: lobbyID,
            seed: seed,
            deckName: deckName,
            deckSize: deckSize,
            playerName: values.displayName
        });
        setLobbyCreated(true)
        toast.success("Lobby created!");
        form.reset();
    }

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
                <DialogHeader>
                    <DialogTitle>
                        <div className='sm:text-2xl'>
                            <span>Lobby</span>
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        {
                            !lobbyCreated && <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
                                    <FormField
                                        control={form.control}
                                        name="displayName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Enter your name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit">Create Game</Button>
                                </form>
                            </Form>
                        }
                        {
                            lobbyCreated && <div className='flex flex-col gap-2'>
                                <div className="flex items-center w-full max-w-sm space-x-2">
                                    <Button variant="outline" onClick={() => handleCopyClipboard()}>
                                        <ClipboardCopy />
                                    </Button>
                                    <Input className='w-64' type="text" value={lobbyLink} />
                                </div>
                                <div className="">
                                    <p>Share this link with your friends</p>
                                </div>
                                <Button type="button">Start Game</Button>
                            </div>
                        }
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );

}