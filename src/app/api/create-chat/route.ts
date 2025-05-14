import { createChat } from "@/db";
import { auth } from "@clerk/nextjs/server";

/** 创建一条新的聊天 */
export async function POST(req: Request) {
  /** 获取请求体，从中获取标题和模型 */
  const { title, model } = await req.json();

  /** 获取用户id */
  const { userId } = await auth();

  /** 如果用户id存在 */
  if (userId) {
    // 1. 创建一个chat
    const newChat = await createChat(title, userId, model);

    // 2. 返回新chat的id
    return new Response(JSON.stringify({ id: newChat?.id }), { status: 200 });
  }

  /** 如果用户id不存在，返回401 */
  return new Response(null, { status: 401 });
}
