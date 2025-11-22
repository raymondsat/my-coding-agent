'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  // 新增：存历史列表
  const [taskList, setTaskList] = useState<any[]>([]);

  // 1. 定义拉取列表的动作
  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/agent'); // GET
      const data = await res.json();
      if (data.success) {
        setTaskList(data.tasks);
      }
    } catch (e) {
      console.error("获取列表失败");
    }
  };

  // 2. 自动触发：页面一加载，就拉一次列表
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
        setPrompt(""); // 清空输入框
        alert(`🎉 任务创建成功！ID: ${data.taskId}`);
        fetchTasks(); // 👈 关键：成功后刷新列表
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

      {/* 历史列表区 */}
      <div className="w-full max-w-2xl mt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-700 ml-2">📜 历史任务</h2>
        <div className="space-y-3">
          {taskList.map((task) => (
            <div key={task.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
              <div>
                <p className="font-bold text-gray-800 text-lg">#{task.id} {task.prompt}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(task.created_at).toLocaleString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border
                ${task.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                  task.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
              `}>
                {task.status}
              </span>
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