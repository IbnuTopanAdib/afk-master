import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }), 
    googleId: varchar('google_id', { length: 255 }),
    authProvider: varchar('auth_provider', { length: 50 }).default('local'), 
    avatar : text('avatar'),
    lastLoginAt: timestamp('last_login_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;