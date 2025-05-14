import { getMessagesByChatId } from "@/db"
import { useAuth } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
    const {chatId, chatUserId} = await req.json()
    const {userId} = await auth()
    if (!userId || chatUserId !== userId) {
        return new Response(JSON.stringify({error: 'unauthorized'}), {
            status: 401
        })
    }

    const messages = await getMessagesByChatId(chatId)
    return new Response(JSON.stringify(messages), {status: 200})
}