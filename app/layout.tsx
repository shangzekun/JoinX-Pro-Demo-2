import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JoinX Pro 工艺开发演示",
  description: "展示多智能体工艺决策流程的前端 Demo"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-100">
        {children}
      </body>
    </html>
  );
}
