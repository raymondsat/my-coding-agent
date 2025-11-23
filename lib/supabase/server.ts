// lib/supabase/server.ts
import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
    // ✅ Next 16 要求：cookies() 是 async，必须 await
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // = anon/publishable key
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // 如果在 Server Component 里被调用，没有写 cookie 能力，可以忽略
                        // 官方示例里也是这么写的:contentReference[oaicite:3]{index=3}
                    }
                },
            },
        }
    );
}
