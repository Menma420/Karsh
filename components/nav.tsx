"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { useState, useEffect, useRef } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  if (pathname === "/login") return null;

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
      setMenuOpen(false);
    }
  };

  // Close overflow menu on Escape or outside click
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const primaryNav = [
    { href: "/", label: "Today" },
    { href: "/calendar", label: "Calendar" },
    { href: "/timeline", label: "Timeline" },
  ];

  const overflowNav = [
    { href: "/experiments", label: "Experiments" },
    { href: "/decisions", label: "Decisions" },
    { href: "/learning-records", label: "Learning" },
    { href: "/reviews/weekly", label: "Reviews" },
    { href: "/capabilities", label: "Capabilities" },
    { href: "/ai-review", label: "Prepare AI Review" },
    { href: "/ai-import", label: "Import AI" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <header className="h-[52px] bg-[#16151A] border-b border-[#2A2934]/60 px-6 flex items-center justify-between sticky top-0 z-40 shadow-none">
      {/* Left group — Brand + Primary Nav */}
      <nav className="flex items-center gap-[32px]">
        <Link
          href="/"
          className="font-display text-[15px] font-medium text-[#EDEAE3] tracking-tight text-decoration-none"
        >
          Capability OS
        </Link>

        <ul className="flex items-center gap-[24px] list-none m-0 p-0">
          {primaryNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`text-[14px] font-sans font-normal pb-[2px] border-b-2 text-decoration-none transition-colors duration-120 ${
                    isActive
                      ? "text-[#EDEAE3] border-[#C9A26D]"
                      : "text-[#8B8894] border-transparent hover:text-[#EDEAE3]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Right group — Search trigger + Overflow menu */}
      <div className="flex items-center gap-[20px] relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => router.push("/search")}
          className="font-sans text-[12px] text-[#5C5A66] hover:text-[#8B8894] bg-transparent border-0 cursor-pointer transition-colors duration-120 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A26D] focus-visible:outline-offset-2"
        >
          Search <span className="ml-1 text-[11px]">⌘K</span>
        </button>

        <button
          ref={menuTriggerRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="font-sans text-[14px] text-[#8B8894] hover:text-[#EDEAE3] bg-transparent border-0 cursor-pointer transition-colors duration-120 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A26D] focus-visible:outline-offset-2"
        >
          Menu
        </button>

        {/* Overflow Dropdown Panel */}
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-[200px] bg-[#232229] border border-[#2A2934] rounded-[10px] p-[6px] z-50 flex flex-col shadow-none"
          >
            {overflowNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className={`block w-full text-left font-sans text-[14px] px-[12px] py-[10px] rounded-[6px] border-0 text-decoration-none transition-colors duration-120 ${
                    isActive
                      ? "text-[#EDEAE3] bg-[#C9A26D]/15 font-medium"
                      : "text-[#8B8894] hover:text-[#EDEAE3] hover:bg-[rgba(201,162,109,0.12)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="h-[1px] bg-[#2A2934]/50 my-[6px]" />

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className="block w-full text-left font-sans text-[14px] px-[12px] py-[10px] rounded-[6px] border-0 text-[#8B8894] hover:text-[#EDEAE3] hover:bg-[rgba(201,162,109,0.12)] transition-colors duration-120 cursor-pointer"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
