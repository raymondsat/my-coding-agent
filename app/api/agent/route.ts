// src/app/api/agent/route.ts
import { NextRequest, NextResponse } from 'next/server';
// 👇 这里引入了我们刚才在 lib 里建好的工具，直接用！
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
    try {
        // 1. 解析前端发来的 JSON 数据
        const body = await request.json();
        const prompt = body.prompt;

        // 简单的校验：如果没写需求，直接驳回
        if (!prompt) {
            return NextResponse.json({ error: "需求不能为空" }, { status: 400 });
        }

        // 2. 核心动作：在 Supabase 的 'tasks' 表里插一条数据
        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    prompt: prompt,
                    status: 'pending', // 初始状态：待处理
                }
            ])
            .select() // 👈 这一步很关键：告诉数据库“插入完把新生成的那行数据还给我”
            .single(); // 确认只返回一条

        // 如果数据库报错（比如表不存在，或者连不上）
        if (error) {
            console.error("Supabase 开单失败:", error);
            throw error;
        }

        console.log("✅ 新任务创建成功，ID:", data.id);

        // 3. 成功回执：把 ID 返回给前端
        return NextResponse.json({
            success: true,
            taskId: data.id,
            message: "任务已接收"
        });

    } catch (error: any) {
        // 兜底错误处理
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 👇 新增：处理 GET 请求 (查)
export async function GET() {
    try {
        // 核心动作：去 'tasks' 表里查数据
        // .select('*') 意思是：我要所有列 (id, prompt, status...)
        // .order(...) 意思是：按创建时间倒序排 (最新的在最上面)
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // 把查到的列表 (数组) 返回给前端
        return NextResponse.json({
            success: true,
            tasks: data
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
