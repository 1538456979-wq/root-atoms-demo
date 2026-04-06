import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atoms Generator",
  description: "Atoms Generator — 原子组件生成工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* 引入 Tailwind CDN，确保 react-live 动态渲染的 JSX 样式正常生效 */}
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
