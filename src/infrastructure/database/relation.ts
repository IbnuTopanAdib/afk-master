import { refreshTokens } from "@/modules/auth/user_tokens.schema";
import { users } from "@/modules/user/user.schema";
import { relations } from "drizzle-orm";

export const userRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
}));

export const refreshTokenRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));
