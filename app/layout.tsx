import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AccessCodeGuard from "@/components/AccessCodeGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Municip'All Master Admin",
  description: "Global management interface for Municip'All",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased`}>
        <AccessCodeGuard>
          <div className="flex min-h-screen bg-[#fcfcfd]">
            <Sidebar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AccessCodeGuard>
      </body>
    </html>
  );
}
