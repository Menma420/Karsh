"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Clock, 
  FlaskConical, 
  GitCommit, 
  BookOpen, 
  FileCheck, 
  BrainCircuit, 
  Copy, 
  Download, 
  Search as SearchIcon, 
  Settings as SettingsIcon, 
  LogOut,
  LayoutDashboard
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await apiFetch("/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (pathname === "/login") return null;

  const links = [
    { href: "/", label: "Today", icon: LayoutDashboard },
    { href: "/entries/new", label: "+ Record", icon: PlusCircle, highlight: true },
    { href: "/calendar", label: "Calendar", icon: CalendarIcon },
    { href: "/timeline", label: "Timeline", icon: Clock },
    { href: "/experiments", label: "Experiments", icon: FlaskConical },
    { href: "/decisions", label: "Decisions", icon: GitCommit },
    { href: "/learning-records", label: "Learning", icon: BookOpen },
    { href: "/reviews/weekly", label: "Reviews", icon: FileCheck },
    { href: "/capabilities", label: "Capabilities", icon: BrainCircuit },
    { href: "/ai-review", label: "Prepare AI Package", icon: Copy },
    { href: "/ai-import", label: "Import AI Assessment", icon: Download },
    { href: "/search", label: "Search", icon: SearchIcon },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6 overflow-x-auto py-2 no-scrollbar">
            <Link href="/" className="font-semibold text-slate-100 whitespace-nowrap tracking-wide text-sm sm:text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Capability OS
            </Link>

            <nav className="flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                      link.highlight
                        ? "bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                        : isActive
                        ? "bg-slate-800 text-slate-100 border border-slate-700"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors ml-2 shrink-0"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
