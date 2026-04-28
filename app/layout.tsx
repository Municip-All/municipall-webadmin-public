import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AccessCodeGuard from "@/components/AccessCodeGuard";
import { ToastProvider } from "@/context/ToastContext";

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
      <body className={inter.className}>
        <ToastProvider>
          <AccessCodeGuard>
            <div className="flex h-screen bg-[#fcfcfd] overflow-hidden text-[#18181b]">
              <Sidebar />
              <main className="flex-1 overflow-hidden relative">
                {children}
              </main>
            </div>
          </AccessCodeGuard>
        </ToastProvider>
      </body>
    </html>
  );
}
