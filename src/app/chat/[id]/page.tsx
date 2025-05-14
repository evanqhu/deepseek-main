"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import EastIcon from "@mui/icons-material/East";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import SideBar from "@/components/side-bar";
import ReactMarkdown from "react-markdown";

export default function Page() {
  const { id } = useParams(); // 获取聊天 ID
  const [model, setModel] = useState("deepseek-v3"); // 选择的模型
  const endRef = useRef<HTMLDivElement>(null); // 聊天记录底部参考

  /** 获取聊天信息 */
  const { data: chat } = useQuery({
    queryKey: ["chat", id],
    queryFn: () => {
      return axios.post(`/api/get-chat`, {
        chatId: id,
      });
    },
  });

  /** 获取聊天记录 */
  const { data: previousMessages } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => {
      return axios.post(`/api/get-messages`, {
        chatId: id,
        chatUserId: chat?.data?.userId,
      });
    },
    enabled: !!chat?.data?.id,
  });

  /** 切换模型 */
  const handleChangeModel = () => {
    setModel(model === "deepseek-v3" ? "deepseek-r1" : "deepseek-v3");
  };

  /**
   * 使用 AI SDK 的 useChat 组件
   * messages: 消息列表
   * input: 输入框内容
   * handleInputChange: 输入框内容变化回调
   * handleSubmit: 提交按钮点击回调
   * append: 添加消息回调
   * body: 请求体
   * initialMessages: 初始消息列表
   */
  const { messages, input, handleInputChange, handleSubmit, append } = useChat({
    // 默认的 api 端点为 /api/chat，post 请求
    // 请求体
    body: {
      model: model,
      chatId: id,
      chatUserId: chat?.data?.userId,
    },
    initialMessages: previousMessages?.data,
  });

  /** 聊天记录自动滚动到最底部 */
  useEffect(() => {
    if (endRef.current) {
      endRef?.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /** 处理第一条消息 */
  const handleFirstMessage = async (model: string) => {
    if (chat?.data?.title && previousMessages?.data?.length === 0) {
      await append({
        role: "user",
        content: chat?.data?.title,
      }),
        {
          model: model,
          chatId: id,
          chatUserId: chat?.data?.userId,
        };
    }
  };

  /** 设置模型 */
  useEffect(() => {
    setModel(chat?.data?.model);
    handleFirstMessage(chat?.data?.model);
  }, [chat?.data?.title, previousMessages]);

  return (
    <div className="w-screen h-screen flex flex-row">
      <div className="w-64 bg-gray-50">
        <SideBar />
      </div>
      <div className="flex-1 flex flex-col gap-8 justify-between items-center py-16">
        {/* 聊天记录 */}
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 overflow-y-auto justify-between flex-1 scrollbar-hide">
          <div className="flex flex-col gap-8 flex-1">
            {messages?.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg flex flex-row ${
                  message?.role === "assistant" ? "justify-start mr-18" : "justify-end ml-10"
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message?.role === "assistant" ? "bg-blue-300" : "bg-slate-100"
                  }`}
                >
                  <ReactMarkdown>{message?.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
          <div className="h-4" ref={endRef}></div>
        </div>

        {/* 输入框 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="w-full max-w-3xl mx-auto flex flex-col items-center justify-between gap-4 shadow-lg border-[1px] border-gray-300 h-48 rounded-2xl p-4"
        >
          <textarea
            name="input"
            className="w-full rounded-lg focus:outline-none p-1"
            value={input}
            placeholder="请输入您的问题"
            rows={8}
            maxLength={1000}
            style={{ resize: "none" }}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          ></textarea>
          <div className="flex flex-row items-center justify-between w-full">
            <div
              className={`flex flex-row items-center justify-center rounded-lg border-[1px] px-2 py-1 cursor-pointer ${
                model === "deepseek-r1" ? "border-blue-300 bg-blue-200" : "border-gray-300"
              }`}
              onClick={handleChangeModel}
            >
              <p className="text-sm">深度思考(R1)</p>
            </div>
            <button type="submit" className="flex items-center justify-center border-2 border-black p-1 rounded-full">
              <EastIcon style={{ fontSize: "18px" }}></EastIcon>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
