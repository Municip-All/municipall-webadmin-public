import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AccessCodeGuard from "@/components/AccessCodeGuard";
import { ToastProvider } from "@/context/ToastContext";
import { ConfirmDialogProvider } from "@/context/ConfirmDialogContext";
import { PanelRoleProvider } from "@/context/PanelRoleContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Municip'All Panel",
  description: "Interface d'administration globale Municip'All",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased`}>
        <ToastProvider>
          <ConfirmDialogProvider>
            <AccessCodeGuard>
              <PanelRoleProvider>
                <div className="flex h-screen overflow-hidden bg-[var(--background)] text-slate-900">
                  <Sidebar />
                  <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
                    {children}
                  </main>
                </div>
              </PanelRoleProvider>
            </AccessCodeGuard>
          </ConfirmDialogProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
