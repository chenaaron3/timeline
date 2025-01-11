import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { string, z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '~/components/ui/form';
import { useGameStore, useMultiplayerStore } from '~/state';
import { api } from '~/utils/api';
import { DECK_NAMES } from '~/utils/constants';
import { generateUniqueID } from '~/utils/utils';

import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '../ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';

const formSchema = z.object({
    displayName: z.string().min(2).max(26),
})

export const LobbyEntrance = () => {
    // Access query parameters from the router object
    const router = useRouter()
    const { query } = router;

    // APIS
    const createLobby = api.multiplayer.createLobby.useMutation();
    const joinLobby = api.multiplayer.joinLobby.useMutation();

    // Global State
    const init = useGameStore.use.init();
    const seed = useGameStore.use.seed();
    const deckName = useGameStore.use.deckName();
    const deckSize = useGameStore.use.deckSize();
    const lobbyID = useMultiplayerStore.use.lobbyID();
    const setLobbyID = useMultiplayerStore.use.setLobbyID();
    const setPlayerID = useMultiplayerStore.use.setPlayerID();
    const setPlayers = useMultiplayerStore.use.setPlayers();
    const setLobbyOpen = useMultiplayerStore.use.setLobbyOpen();

    // Local State
    const [formSubmitted, setFormSubmitted] = useState(false)

    useEffect(() => {
        const inputElement = document.querySelector("#lobbyinput") as HTMLElement
        if (inputElement) {
            setTimeout(() => {
                inputElement.focus()
            }, 250)
        }
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            displayName: "",
        },
    })

    const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
        setFormSubmitted(true);

        const joinLobbyAsync = async (lobbyID: string) => {
            const lobbyResults = await joinLobby.mutateAsync({
                lobbyID: lobbyID,
                playerName: values.displayName
            })
            if (lobbyResults) {
                const details = lobbyResults
                const deckName = details.deckName as DECK_NAMES
                const deckSize = details.deckSize
                const seed = parseFloat(details.seed)
                setLobbyID(lobbyID);
                setPlayerID((details.players as string[]).length)
                setPlayers(details.players as string[])
                init(deckName, deckSize, undefined, seed);
            } else {
                // Lobby doesn't exist
                toast.error("Lobby was not found!");
                setFormSubmitted(false)
                setLobbyOpen(false)
            }

            // Clear the ticket for joining this lobby (whether or not it was successful or not)
            const newQuery = { ...query };
            delete newQuery.lobby
            void router.push(
                {
                    pathname: router.pathname,
                    query: newQuery,
                },
                undefined,
                { shallow: true }
            );
        }

        // Joining an existing lobby
        if (query.lobby != null) {
            void joinLobbyAsync(query.lobby as string);
        } else {
            const lobbyID = generateUniqueID();
            // Creating a lobby
            createLobby.mutate({
                lobbyID: lobbyID,
                seed: seed,
                deckName: deckName,
                deckSize: deckSize,
                playerName: values.displayName
            });
            setLobbyID(lobbyID);
            setPlayerID(1);
            setPlayers([values.displayName])
            // Reset the game 
            init(deckName, deckSize, undefined, seed);
            toast.success("Lobby created!");
        }
        form.reset();
    }, [query.lobby, lobbyID])

    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <DialogHeader>
                <DialogTitle>
                    <span className='sm:text-2xl'>{query.lobby ? "Join" : "Create"} a Game</span>
                </DialogTitle>
                <DialogDescription>

                </DialogDescription>
            </DialogHeader>

            <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => {
                    return (
                        <FormItem>
                            <FormControl>
                                <Input id="lobbyinput" tabIndex={-1} autoFocus placeholder="Enter your name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )
                }}
            />

            <Button type="submit">
                {formSubmitted && <Loader2 className="animate-spin" />}
                {query.lobby ? "Join" : "Create"}
            </Button>
        </form>
    </Form >
}