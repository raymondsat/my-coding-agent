// api/agent/route.ts

import { NextRequest, NextResponse } from 'next/server';
// 1. 新增：App Router 下获取请求 Cookie 的工具
import { cookies } from 'next/headers';
// 2. 新增：创建用户限定 Supabase 客户端的工具
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// ⚠️ 注意：请移除或注释掉原来的 import { supabase } from '@/lib/supabaseClient';


export async function POST(request: NextRequest) {
    // RLS 前提 1：创建用户限定客户端
    const supabase = createRouteHandlerClient({ cookies });

    try {
        const body = await request.json();
        const prompt = body.prompt;

        if (!prompt) return NextResponse.json({ error: "需求不能为空" }, { status: 400 });


        const { data, error } = await supabase
            .from('tasks')
            .insert([{ prompt, status: 'pending' }])
            .select()
            .single();

        if (error) throw error;


        const n8nUrl = process.env.N8N_WEBHOOK_URL;

        if (n8nUrl) {
            // Fire-and-Forget (发完即走，不等待 n8n 返回结果)
            fetch(n8nUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // 哪怕 n8n 现在是全量查，我们还是把 ID 传过去，为了以后扩展方便
                body: JSON.stringify({ id: data.id })
            }).catch(err => console.error("⚠️ 无法触发 n8n:", err));
        }


        return NextResponse.json({
            success: true,
            taskId: data.id,
            message: "任务已创建，AI 正在赶来..."
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 👇 新增：处理 GET 请求 (查)
export async function GET() {

    const supabase = createRouteHandlerClient({ cookies });

    try {

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