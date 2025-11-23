'use client';

import { useState, useEffect } from 'react';
// ✅ 改动 1：不要再用旧的 supabaseClient，改用新的 browser client 工厂
import { createClient } from '@/lib/supabase/client';

// 在模块顶层创建浏览器端 Supabase 实例（官方推荐）
const supabase = createClient();

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [taskList, setTaskList] = useState<any[]>([]);

  const [email, setEmail] = useState('');

  // 1. 拉取列表（当前登录用户的 tasks，会被 RLS 自动过滤）
  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/agent');
      const data = await res.json();

      if (res.status === 401) {
        console.warn('未登录，无法获取任务列表');
        setTaskList([]);
        return;
      }

      if (data.success) {
        setTaskList(data.tasks);
      } else {
        console.error('获取列表失败:', data.error);
      }
    } catch (e) {
      console.error('获取列表失败', e);
    }
  };

  // 2. 自动轮询
  useEffect(() => {
    fetchTasks(); // 进页面先查一次

    const interval = setInterval(() => {
      fetchTasks();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 3. 新建任务：会打到 /api/agent → 后端用当前 session + RLS 写入 user_id
  const startTask = async () => {
    if (!prompt) return;
    setLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (res.status === 401) {
        alert('请先登录后再创建任务');
        return;
      }

      if (data.success) {
        setPrompt('');
        alert(`🎉 任务创建成功！ID: ${data.taskId}`);
        fetchTasks();
      } else {
        alert('创建失败: ' + data.error);
      }
    } catch (e) {
      alert('网络错误');
    } finally {
      setLoading(false);
    }
  };

  // 4. 登录函数：使用 Magic Link 登录（Supabase Auth）
  const handleSignIn = async () => {
    if (!email) return alert('请输入邮箱');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin, // 登录后重定向回当前页面
      },
    });

    if (error) {
      console.error('登录错误:', error);
      alert('登录失败: ' + error.message);
    } else {
      alert('🎉 Magic Link 已发送！请检查你的邮箱并点击链接。');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-4 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">AI Coding Agent 🤖</h1>

        {/* ✅ 改动 2：登录区域，触发 Supabase Auth */}
        <div className="mb-6 flex gap-2">
          <input
            type="email"
            className="flex-1 p-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="请输入邮箱，使用 Magic Link 登录"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="button"
            onClick={handleSignIn}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            发送登录链接
          </button>
        </div>

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
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {loading ? '创建中...' : '🚀 新建任务'}
        </button>
      </div>

      {/* 📜 历史列表区 */}
      <div className="w-full max-w-2xl mt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-700 ml-2">📜 历史任务</h2>
        <div className="space-y-4">
          {taskList.map((task) => (
            <div
              key={task.id}
              className="p-5 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start w-full">
                <div>
                  <p className="font-bold text-gray-800 text-lg">
                    #{task.id} {task.prompt}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(task.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0
                  ${task.status === 'completed'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : task.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }
                `}
                >
                  {task.status}
                </span>
              </div>

              {task.result && (
                <div className="mt-2 p-4 bg-slate-800 rounded-md overflow-x-auto">
                  <p className="text-xs text-slate-400 mb-2 font-mono">AI 生成结果：</p>
                  <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                    {task.result}
                  </pre>
                </div>
              )}
            </div>
          ))}

          {taskList.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              还没有任务，先登录，然后创建一个试试～
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
