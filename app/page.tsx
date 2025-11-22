// src/app/page.tsx

// 1. 这里的 export default function 是标准组件写法
export default function Home() {

  // 定义一个变量（TS 自动推断它是 string 类型）
  const title = "我的第一个 Next.js + TS 项目";

  return (
    // 2. Tailwind CSS 的样式：min-h-screen (全屏高度), p-24 (内边距)
    <main className="flex min-h-screen flex-col items-center justify-center p-24">

      <h1 className="text-4xl font-bold mb-4">
        {title}
      </h1>

      <p className="text-xl text-gray-500">
        TypeScript 环境加载正常 ✅
      </p>

    </main>
  );
}