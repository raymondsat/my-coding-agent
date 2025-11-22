'use client';

import { useState } from 'react';

interface UserData {
  name: string;
  role: string;
  level: number;
}

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null);

  // 1. 新增一个状态，专门用来存输入框里的文字
  const [inputName, setInputName] = useState("");

  const fetchUser = async () => {
    // 2. 修改请求地址：把输入框里的 inputName 拼接到 URL 后面
    // 比如变成 /api/user?name=Jack
    const res = await fetch(`/api/user?name=${inputName}`);
    const data = await res.json();
    setUser(data);
  };

  // 新增一个状态，用来存“备注”
  const [inputNote, setInputNote] = useState("");

  // 修改后的提交函数
  const submitData = async () => {

    // 1. 准备要发送的包裹 (JSON 对象)
    const payload = {
      name: inputName,
      note: inputNote
    };

    // 2. 发送 POST 请求
    const res = await fetch('/api/user', {
      method: 'POST', // <--- 关键：动作变成了 POST
      headers: {
        'Content-Type': 'application/json' // 告诉后端我是 JSON
      },
      body: JSON.stringify(payload) // <--- 关键：数据放在 body 里
    });

    const data = await res.json();
    setUser(data); // 这里的 user 类型可能需要根据返回结果微调，或者简单点先复用
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-8">POST 提交测试</h1>

      <div className="flex flex-col gap-4 mb-4 w-full max-w-md">
        <input
          type="text"
          placeholder="请输入名字..."
          className="border p-2 rounded text-black"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
        />

        <input
          type="text"
          placeholder="写点备注 (比如: 我是 PM)..."
          className="border p-2 rounded text-black"
          value={inputNote}
          onChange={(e) => setInputNote(e.target.value)}
        />

        <button
          onClick={submitData}
          className="bg-purple-600 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded"
        >
          提交数据 (POST)
        </button>
      </div>

      {user && (
        <div className="mt-8 p-6 border-2 border-purple-500 rounded-lg bg-purple-50 w-full max-w-md">
          <h2 className="text-xl font-semibold text-purple-700">后端返回：</h2>
          {/* 这里如果不匹配之前的类型定义可能会报错，我们先暂时用 JSON.stringify 看看原始数据 */}
          <pre className="mt-4 text-sm text-gray-800 whitespace-pre-wrap">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}