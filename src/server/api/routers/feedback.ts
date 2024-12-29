import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { feedback } from '~/server/db/schema';

export const feedbackRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ comments: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(feedback).values({
        comments: input.comments,
      });
    }),
  private: protectedProcedure.query(async ({ ctx }) => {
    return ctx.auth;
  }),
});
