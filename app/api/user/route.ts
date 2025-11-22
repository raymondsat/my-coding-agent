import { NextRequest, NextResponse } from 'next/server';

// 注意：GET 函数现在需要接收 request 参数了
export async function GET(request: NextRequest) {

    // 1. 获取 URL 里的查询参数
    // 就像之前 Node.js 的 req.query，但在 Next.js 里写法稍微不同
    const searchParams = request.nextUrl.searchParams;
    const queryName = searchParams.get('name');

    // 2. 动态逻辑
    // 如果前端传了名字，就用传过来的；如果没传，就默认是 "PM Alex"
    const finalName = queryName ? queryName : "PM Alex";

    const user = {
        name: finalName,
        role: "Product Manager",
        level: 99
    };

    return NextResponse.json(user);
}

export async function POST(request: NextRequest) {

    // 核心区别：POST 的数据在 body 里
    // 我们需要用 await request.json() 来解析它
    // (以前在 Express 里是 req.body，这里需要显式解析一下)
    const body = await request.json();

    console.log("后端收到了 POST 数据:", body);

    // 模拟处理逻辑：假设我们要把用户提交的 note 加进去
    const responseData = {
        message: "数据已保存",
        receivedUser: body.name,
        receivedNote: body.note,
        timestamp: new Date().toISOString()
    };

    return NextResponse.json(responseData);
}

