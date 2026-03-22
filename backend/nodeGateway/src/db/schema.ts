import {
  pgTable,
  uuid,
  text,
  timestamp,
  check,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── users ───────────────────────────────────────────────
export const users = pgTable("users", {
  id:        uuid("id").primaryKey().defaultRandom(),
  email:     text("email").notNull().unique(),
  username:  text("username").notNull().unique(),
  password:  text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── conversations ────────────────────────────────────────
export const conversations = pgTable("conversations", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title:     text("title").notNull().default("New conversation"),
  status:    text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  check("conversations_status_check", sql`${t.status} IN ('active', 'archived')`),
  index("conversations_user_id_idx").on(t.userId),
]);

// ─── messages ─────────────────────────────────────────────
export const messages = pgTable("messages", {
  id:             uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role:           text("role").notNull(),
  content:        text("content").notNull(),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  check("messages_role_check", sql`${t.role} IN ('user', 'assistant', 'system')`),
  index("messages_conversation_id_idx").on(t.conversationId),
]);