import { eq } from 'drizzle-orm';
import Pusher from 'pusher';
import { number, z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { lobby } from '~/server/db/schema';
import { MessageTypes, OnPlayerJoinMessage } from '~/utils/types';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export const multiplayerRouter = createTRPCRouter({
  createLobby: publicProcedure
    .input(
      z.object({
        lobbyID: z.string().min(1),
        seed: z.number(),
        deckName: z.string(),
        deckSize: z.number(),
        playerName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(lobby).values({
        id: input.lobbyID,
        seed: input.seed.toString(),
        deckName: input.deckName,
        deckSize: input.deckSize,
        players: [input.playerName],
      });
    }),
  joinLobby: publicProcedure
    .input(
      z.object({
        lobbyID: z.string().min(1),
        playerName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the existing players in the lobby
      const existingLobby = await ctx.db
        .select({
          players: lobby.players,
        })
        .from(lobby)
        .where(eq(lobby.id, input.lobbyID))
        .limit(1);
      // Check if lobby does not exists, return
      if (!existingLobby || existingLobby.length == 0) {
        return;
      }
      const existingPlayers = existingLobby[0]!.players as string[];
      if (existingPlayers) {
        existingPlayers.push(input.playerName);
      }
      const update = await ctx.db
        .update(lobby)
        .set({
          players: existingPlayers,
        })
        .where(eq(lobby.id, input.lobbyID))
        .returning();

      //  Notify all players that a new player joined
      pushMessage<OnPlayerJoinMessage>(input.lobbyID, "onPlayerJoin", {
        playerID: existingPlayers.length,
        playerNames: existingPlayers,
      });
      return update[0];
    }),
  sendMessage: publicProcedure
    .input(
      z.object({
        lobbyID: z.string().min(1),
        event: z.string().min(1),
        message: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line
      pushMessage<any>(
        input.lobbyID,
        input.event as MessageTypes,
        input.message,
      );
    }),
});

function pushMessage<T>(
  lobbyID: string,
  messageType: MessageTypes,
  message: T,
) {
  void pusher.trigger(lobbyID, messageType, {
    message: message,
  });
}
