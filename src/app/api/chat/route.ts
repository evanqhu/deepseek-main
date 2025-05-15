/** 处理聊天请求 */
import { createMessage } from "@/db";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { auth } from "@clerk/nextjs/server";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

/** 创建 DeepSeek 实例 */
const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.BASE_URL,
});

/** 处理聊天请求 */
export async function POST(req: Request) {
  // 获取请求体，从中获取消息、模型、聊天id、用户id
  const { messages, model, chatId, chatUserId } = await req.json();

  // 获取用户id 
  const { userId } = await auth();

  // 如果用户id不存在，或者用户id不等于聊天用户id，返回401
  if (!userId || userId !== chatUserId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // 存入用户消息
  const lastMessage = messages[messages.length - 1];
  await createMessage(chatId, lastMessage.content, lastMessage.role);

  // 使用 DeepSeek 模型生成响应
  const result = streamText({
    // 使用的模型
    model: deepseek(model),
    // 系统提示词
    system: "You are a helpful assistant.",
    // 用户与聊天机器人之间的对话历史记录
    messages,
    // 当生成完成时，将结果存入数据库
    onFinish: async (result) => {
      await createMessage(chatId, result.text, "assistant");
    },
  });

  // 将结果转换为流式响应对象
  return result.toDataStreamResponse();
}
