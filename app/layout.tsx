import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Layout/Sidebar";

export const metadata: Metadata = {
  title: "Dev Diary - 開発日記",
  description: "ローカル環境で使える開発日記アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
