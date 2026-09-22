import "./global.css";
import { Navbar } from "@/components/nav";
import { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal Capability OS",
  description: "Private system for tracking capability development evidence and experiments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full bg-[#16151A]`}>
      <body suppressHydrationWarning className="h-full flex flex-col min-h-screen text-[#EDEAE3] bg-[#16151A] antialiased selection:bg-[#C9A26D]/30 selection:text-[#EDEAE3]">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-[#2A2934]/40 py-8 text-center text-xs text-[#5C5A66]">
          Personal Capability OS &bull; Empirical Self-Improvement System
        </footer>
      </body>
    </html>
  );
}
