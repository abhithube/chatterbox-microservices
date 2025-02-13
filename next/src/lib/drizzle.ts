import { relations } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'
import {
  boolean,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  image: text(),
})

export const parties = pgTable('parties', {
  id: text().notNull().primaryKey(),
  title: text().notNull(),
})

export const partyUsers = pgTable(
  'party_users',
  {
    partyId: text('party_id').notNull(),
    userId: text('user_id').notNull(),
    isAdmin: boolean().notNull().default(false),
  },
  (table) => [primaryKey({ columns: [table.partyId, table.userId] })],
)

export const topics = pgTable('topics', {
  id: text().notNull().primaryKey(),
  title: text().notNull(),
  partyId: text('party_id').notNull(),
})

export const messages = pgTable('messages', {
  id: text().notNull().primaryKey(),
  content: text().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  topicId: text('topic_id').notNull(),
  userId: text('user_id').notNull(),
})

const usersRelations = relations(users, ({ many }) => ({
  partyUsers: many(partyUsers),
  messages: many(messages),
}))

const partiesRelations = relations(parties, ({ many }) => ({
  topics: many(topics),
  partyUsers: many(partyUsers),
}))

const partyUsersRelations = relations(partyUsers, ({ one }) => ({
  party: one(parties, {
    fields: [partyUsers.partyId],
    references: [parties.id],
  }),
  user: one(users, {
    fields: [partyUsers.userId],
    references: [users.id],
  }),
}))

const topicsRelations = relations(topics, ({ one, many }) => ({
  party: one(parties, {
    fields: [topics.partyId],
    references: [parties.id],
  }),
  messages: many(messages),
}))

const messagesRelations = relations(messages, ({ one }) => ({
  topic: one(topics, {
    fields: [messages.topicId],
    references: [topics.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}))

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: {
    users,
    usersRelations,
    parties,
    partiesRelations,
    partyUsers,
    partyUsersRelations,
    topics,
    topicsRelations,
    messages,
    messagesRelations,
  },
})
