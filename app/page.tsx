'use client'; // 👈 开启交互模式

import { useState } from 'react';

export default function Home() {
  // 1. 定义状态 (State)
  const [prompt, setPrompt] = useState(""); // 存用户输入的需求
  const [taskId, setTaskId] = useState<number | null>(null); // 存生成的任务ID
  const [loading, setLoading] = useState(false); // 存加载状态

  // 2. 提交任务的动作
  const startTask = async () => {
    if (!prompt) return;
    setLoading(true); // 按钮变灰，防止重复点

    try {
      // 呼叫我们刚才写的后端接口
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }), // 把输入的内容发过去
      });

      const data = await res.json();

      if (data.success) {
        setTaskId(data.taskId); // 拿到 ID，界面会自动显示结果框
        alert(`🎉 任务创建成功！ID: ${data.taskId}`);
      } else {
        alert("创建失败: " + data.error);
      }
    } catch (e) {
      alert("网络错误，提交失败");
    } finally {
      setLoading(false); // 无论成功失败，按钮恢复
    }
  };

  // 3. 界面渲染 (HTML + Tailwind)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">AI Coding Agent 🤖</h1>
        <p className="text-gray-500 mb-6">输入你的需求，我们将创建一个 Supabase 任务单。</p>

        {/* 输入框 */}
        <textarea
          className="w-full h-32 p-4 border rounded-lg mb-4 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          placeholder="例如：帮我写一个贪吃蛇游戏..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />

        {/* 提交按钮 */}
        <button
          onClick={startTask}
          disabled={loading || !prompt}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all
            ${loading || !prompt
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
        >
          {loading ? '正在创建任务...' : '🚀 开始生成'}
        </button>

        {/* 成功后的反馈框 */}
        {taskId && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <p className="font-bold text-lg">✅ 任务单已生成</p>
            <p>任务 ID: <span className="font-mono text-xl font-bold">{taskId}</span></p>
            <p className="text-sm mt-2 text-green-600">快去 Supabase 的 tasks 表里看看吧！</p>
          </div>
        )}
      </div>
    </main>
  );
}