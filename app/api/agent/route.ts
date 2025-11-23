// app/api/agent/route.ts

import { NextRequest, NextResponse } from 'next/server';
// ✅ 改动 1：使用我们在 lib/supabase/server.ts 定义的服务端 Client
import { createSupabaseServerClient } from '@/lib/supabase/server';

// 🔹 处理 POST：创建任务
export async function POST(request: NextRequest) {
    // ✅ 改动 2：在 Route Handler 内部创建「带用户身份」的 Supabase 客户端
    const supabase = await createSupabaseServerClient();

    try {
        // 1. 解析请求体，拿到 prompt
        const body = await request.json();
        const prompt = body.prompt;

        if (!prompt) {
            return NextResponse.json({ error: '需求不能为空' }, { status: 400 });
        }

        // 2. 从当前会话中获取用户信息（依赖 cookies + RLS）
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        // 如果没有登录用户，直接返回 401，不再往下插入
        if (userError || !user) {
            return NextResponse.json({ error: '未登录或会话无效' }, { status: 401 });
        }

        // 3. 往 tasks 表插入一条记录
        //    ⚠ 关键：写入 user_id = 当前用户 id，配合你的 RLS policy (user_id = auth.uid())
        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    prompt,
                    status: 'pending',
                    user_id: user.id, // ✅ 改动 3：RLS 必须写 user_id
                },
            ])
            .select()
            .single();

        if (error) throw error;

        // 4. 触发 n8n（异步 Fire-and-forget）
        const n8nUrl = process.env.N8N_WEBHOOK_URL;

        if (n8nUrl) {

            fetch(n8nUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: data.id }),
            }).catch((err) => console.error('⚠️ 无法触发 n8n:', err));
        }

        // 5. 返回创建成功结果
        return NextResponse.json({
            success: true,
            taskId: data.id,
            message: '任务已创建，AI 正在赶来...',
        });

    } catch (error: any) {
        // 捕获所有异常，统一返回 500
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 🔹 处理 GET：查询当前用户的任务列表
export async function GET() {
    // ✅ 改动 4：同样使用带用户身份的 Supabase 客户端
    const supabase = await createSupabaseServerClient();

    try {
        // （可选）如果你希望未登录直接 401，可以主动检查用户
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: '未登录或会话无效' }, { status: 401 });
        }

        // 1. 查询 tasks 表
        //    ⚠ 不需要手动加 where user_id = user.id
        //    RLS policy 已经自动限制只能看到自己 user_id 的记录
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // 2. 返回列表给前端
        return NextResponse.json({
            success: true,
            tasks: data,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
