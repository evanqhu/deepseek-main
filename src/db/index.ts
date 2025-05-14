/**
 * 数据库操作方法
 * 使用 Drizzle ORM 操作数据库
 * 使用 Supabase 作为数据库提供商
 * 使用 Postgres 作为数据库
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { chatsTable, messagesTable } from "./schema";
import { and, desc, eq } from "drizzle-orm";

/** 创建数据库客户端，用于连接数据库 */
const client = postgres(process.env.DATABASE_URL!);
/** 创建对象关系映射实例，用对象方法操作数据库，无需使用 SQL 语句 */
const db = drizzle({ client });

/** 创建一条新的聊天 */
export const createChat = async (title: string, userId: string, model: string) => {
  try {
    const [newChat] = await db
      .insert(chatsTable)
      .values({
        title,
        userId,
        model,
      })
      .returning();
    return newChat; // 可以得到自增的 id，作为 chatId
  } catch (error) {
    console.log("error creating chat", error);
    return null;
  }
};

/** 获取一条聊天 */
export const getChat = async (chatId: number, userId: string) => {
  try {
    const chat = await db
      .select()
      .from(chatsTable)
      .where(and(eq(chatsTable.id, chatId), eq(chatsTable.userId, userId)));
    if (chat.length === 0) {
      return null;
    }
    return chat[0];
  } catch (error) {
    console.log("error getting chat", error);
    return null;
  }
};

/** 获取所有聊天 - 侧边栏 */
export const getChats = async (userId: string) => {
  try {
    const chats = await db.select().from(chatsTable).where(eq(chatsTable.userId, userId)).orderBy(desc(chatsTable.id));
    return chats;
  } catch (error) {
    console.log("error getting chats", error);
    return null;
  }
};

/** 创建一条新的消息 */
export const createMessage = async (chatId: number, content: string, role: string) => {
  try {
    const [newMessage] = await db
      .insert(messagesTable)
      .values({
        content,
        chatId,
        role,
      })
      .returning();
    return newMessage;
  } catch (error) {
    console.log("error createMessage", error);
    return null;
  }
};

/** 获取一条聊天的所有消息 */
export const getMessagesByChatId = async (chatId: number) => {
  try {
    const messages = await db.select().from(messagesTable).where(eq(messagesTable.chatId, chatId));
    return messages;
  } catch (error) {
    console.log("error getMessagesByChatId", error);
    return null;
  }
};
