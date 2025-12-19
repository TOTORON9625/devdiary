import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "Dev Diary - 開発日記",
  description: "ローカル環境で使える開発日記アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const password = process.env.APP_PASSWORD || 'diary123';

  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientLayout password={password}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
