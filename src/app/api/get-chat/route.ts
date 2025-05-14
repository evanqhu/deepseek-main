/** 获取聊天 */
import { getChat } from "@/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { chatId } = await req.json();

  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
    });
  }

  const chat = await getChat(chatId, userId);
  return new Response(JSON.stringify(chat), { status: 200 });
}
