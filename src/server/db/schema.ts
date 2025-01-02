// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm';
import { integer, jsonb, numeric, pgTableCreator, timestamp, varchar } from 'drizzle-orm/pg-core';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `t3_${name}`);

export const feedback = createTable("feedback", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  comments: varchar("comments", { length: 256 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const lobby = createTable("lobby", {
  id: varchar("id", { length: 6 }).primaryKey(),
  deckName: varchar("deck_name", { length: 64 }).notNull(),
  deckSize: integer("deck_size").notNull(),
  seed: numeric("seed").notNull(),
  players: jsonb("players").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
