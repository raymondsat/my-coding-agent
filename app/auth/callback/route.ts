// app/auth/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// 处理 Magic Link / OAuth 登录成功后的回调
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code'); // Supabase 回传的临时代码

    // 没有 code 就直接回首页
    if (!code) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 用我们封装好的服务端 Supabase Client
    const supabase = await createSupabaseServerClient();

    // ✅ 关键一步：用 code 换取 session，并把登录态写入 cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error('exchangeCodeForSession 失败:', error.message);
        // 带一个参数回首页，你愿意的话可以在首页根据这个参数显示“登录失败”
        return NextResponse.redirect(new URL('/?authError=1', request.url));
    }

    // 成功的话重定向回首页，此时：
    // - 前端 supabase.auth.getUser() 能拿到 user
    // - /api/agent 里 supabase.auth.getUser() 也能拿到 user
    return NextResponse.redirect(new URL('/', request.url));
}
