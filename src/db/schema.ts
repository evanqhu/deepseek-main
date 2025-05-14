/** 初始化数据库表结构 */
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

/** 对话列表 */
export const chatsTable = pgTable("chats", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    model: text("model").notNull()
})

/** 一次对话的消息列表 */
export const messagesTable = pgTable("messages", {
    id: serial("id").primaryKey(),
    chatId: integer("chat_id").references(() => chatsTable.id),
    role: text("role").notNull(),
    content: text("content").notNull()
})

/** 对话列表的类型 */
export type ChatModel = typeof chatsTable.$inferSelect
/** 一次对话的消息列表的类型 */
export type MessagesModel = typeof messagesTable.$inferSelect