'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [taskList, setTaskList] = useState<any[]>([]);

  // 1. 拉取列表
  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/agent');
      const data = await res.json();
      if (data.success) {
        setTaskList(data.tasks);
      }
    } catch (e) {
      console.error("获取列表失败");
    }
  };

  // 2. 自动触发
  useEffect(() => {
    fetchTasks();
  }, []);

  const startTask = async () => {
    if (!prompt) return;
    setLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });

      const data = await res.json();

      if (data.success) {
        setPrompt("");
        alert(`🎉 任务创建成功！ID: ${data.taskId}`);
        fetchTasks();
      } else {
        alert("创建失败: " + data.error);
      }
    } catch (e) {
      alert("网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-4 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">AI Coding Agent 🤖</h1>

        <textarea
          className="w-full h-24 p-4 border rounded-lg mb-4 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          placeholder="输入需求..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />

        <button
          onClick={startTask}
          disabled={loading || !prompt}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all
            ${loading || !prompt
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? '创建中...' : '🚀 新建任务'}
        </button>
      </div>

      {/* 📜 历史列表区 */}
      <div className="w-full max-w-2xl mt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-700 ml-2">📜 历史任务</h2>
        <div className="space-y-4">
          {taskList.map((task) => (
            // 修改点 1: 改成 flex-col (竖向布局)，start (左对齐)
            <div key={task.id} className="p-5 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col gap-3 hover:shadow-md transition-shadow">

              {/* 第一行：ID、Prompt 和 状态 */}
              <div className="flex justify-between items-start w-full">
                <div>
                  <p className="font-bold text-gray-800 text-lg">#{task.id} {task.prompt}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(task.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0
                  ${task.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                    task.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
                `}>
                  {task.status}
                </span>
              </div>

              {/* 👇 修改点 2：如果 result 有值，显示结果框 */}
              {task.result && (
                <div className="mt-2 p-4 bg-slate-800 rounded-md overflow-x-auto">
                  <p className="text-xs text-slate-400 mb-2 font-mono">AI 生成结果：</p>
                  {/* whitespace-pre-wrap 保证代码换行正常显示 */}
                  <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                    {task.result}
                  </pre>
                </div>
              )}
            </div>
          ))}

          {taskList.length === 0 && (
            <p className="text-center text-gray-400 py-8">还没有任务，快去建一个吧！</p>
          )}
        </div>
      </div>
    </main>
  );
}