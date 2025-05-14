"use client";

import { useState } from "react";
import EastIcon from "@mui/icons-material/East";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import SideBar from "@/components/side-bar";

export default function Home() {
  const [input, setInput] = useState(""); // 输入框内容
  const [model, setModel] = useState("deepseek-v3"); // 选择的模型
  /** 切换模型 */
  const handleChangeModel = () => {
    setModel(model === "deepseek-v3" ? "deepseek-r1" : "deepseek-v3");
  };

  /** 查询客户端实例 */
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useUser();

  /** 处理变更操作 */
  const { mutate: createChat } = useMutation({
    // 异步请求函数
    mutationFn: async () => {
      return axios.post("/api/create-chat", {
        title: input,
        model: model,
      });
    },
    // 请求成功的回调
    onSuccess: (res) => {
      // 跳转至新聊天页面
      router.push(`/chat/${res.data.id}`);
      // 刷新侧边栏：让 key 为 ["chats"] 的缓存失效，下次会自动重新请求最新数据
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  /** 点击提交按钮回调 */
  const handleSubmit = () => {
    // 如果输入框内容为空，则不进行任何操作
    if (input.trim() === "") {
      return;
    }
    // 如果用户未登录，则跳转至登录页面
    if (!user) {
      router.push("/sign-in");
      return;
    }
    // 触发异步请求
    createChat();
  };

  return (
    <div className="w-screen h-screen flex flex-row">
      <div className="w-64 bg-gray-50">
        <SideBar />
      </div>
      <div className="flex-1">
        <div className="h-screen flex flex-col items-center justify-center">
          <div className="w-full px-64">
            <h2 className="text-bold text-2xl text-center mb-4">有什么可以帮您的吗</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="flex flex-col items-center justify-between gap-4 shadow-lg border-[1px] border-gray-300 h-48 rounded-2xl p-4"
            >
              <textarea
                name="input"
                className="w-full rounded-lg focus:outline-none p-1"
                value={input}
                placeholder="请输入您的问题"
                rows={8}
                maxLength={1000}
                style={{ resize: "none" }}
                onChange={(e) => setInput(e.target.value)}
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
                <button
                  type="submit"
                  className="flex items-center justify-center border-2 border-black p-1 rounded-full"
                >
                  <EastIcon style={{ fontSize: "18px" }}></EastIcon>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
