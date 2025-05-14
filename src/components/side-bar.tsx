/** 侧边栏 */
"use client";

import { ChatModel } from "@/db/schema";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const SideBar = () => {
  const { user } = useUser();
  const router = useRouter();

  /** 获取会话列表 - 查询数据 */
  const { data: chats } = useQuery({
    queryKey: ["chats"],
    queryFn: () => {
      return axios.post("/api/get-chats");
    },
    enabled: !!user?.id,
  });

  /** 获取当前路径 */
  const pathname = usePathname();

  return (
    <div className="h-full">
      <div className="flex items-center justify-center py-4 cursor-pointer" onClick={() => router.push("/")}>
        <p className="font-bold text-2xl">DeepSeek</p>
      </div>
      <div className="w-full flex items-center justify-center">
        <p
          className="h-full px-8 py-2 bg-blue-100 rounded-lg flex items-center justify-center cursor-pointer"
          onClick={() => {
            router.push("/");
          }}
        >
          创建新会话
        </p>
      </div>

      {/* 目录 */}
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        {chats?.data?.map((chat: ChatModel) => (
          <div
            className="w-full cursor-pointer hover:text-blue-500"
            key={chat.id}
            onClick={() => {
              router.push(`/chat/${chat.id}`);
            }}
          >
            <p className={`text-sm line-clamp-1 ${pathname === `/chat/${chat.id}` ? "text-blue-700 font-bold" : ""} `}>
              {chat?.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideBar;
