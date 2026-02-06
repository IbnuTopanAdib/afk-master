import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

import { users } from '../user/user.schema';

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  tokenHash: text('token_hash').notNull(),

  device: text('device'), 

  expiresAt: timestamp('expires_at').notNull(),

  revoked: boolean('revoked').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

