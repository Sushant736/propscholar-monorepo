import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Panel - PropScholar",
  description: "Professional e-commerce admin panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={`${inter.className} admin-layout`}>
        <div className='flex h-screen'>
          <Sidebar />
          <div className='flex-1 flex flex-col overflow-hidden'>
            <Header />
            <main className='flex-1 overflow-y-auto admin-content p-6 pb-32'>
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
