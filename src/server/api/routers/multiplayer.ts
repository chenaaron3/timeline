import { eq } from 'drizzle-orm';
import Pusher from 'pusher';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { lobby } from '~/server/db/schema';

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
      const queryResults = await ctx.db
        .select({
          players: lobby.players,
        })
        .from(lobby)
        .where(eq(lobby.id, input.lobbyID))
        .limit(1);
      const existingPlayers = queryResults[0]!["players"]! as string[];
      if (existingPlayers) {
        existingPlayers.push(input.playerName);
      }
      return await ctx.db
        .update(lobby)
        .set({
          players: existingPlayers,
        })
        .where(eq(lobby.id, input.lobbyID))
        .returning();
    }),
  sendMessage: publicProcedure
    .input(
      z.object({
        channelID: z.string().min(1),
        event: z.string().min(1),
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      pusher.trigger(input.channelID, input.event, {
        message: input.message,
      });
    }),
});
