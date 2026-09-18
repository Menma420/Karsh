"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { useState, useEffect, useRef } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setMobileMenuOpen(false);
      }
    }
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMoreOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

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
      setMoreOpen(false);
      setMobileMenuOpen(false);
    }
  };


  /* ── Route groups ── */
  const secondaryRoutes = [
    "/experiments", "/decisions", "/learning-records",
    "/reviews/weekly", "/capabilities",
    "/ai-review", "/ai-import", "/search", "/settings",
  ];
  const isMoreActive = secondaryRoutes.some((r) => pathname.startsWith(r));

  const modules = [
    { href: "/experiments",      label: "Experiments" },
    { href: "/decisions",        label: "Decisions" },
    { href: "/learning-records", label: "Learning" },
    { href: "/reviews/weekly",   label: "Reviews" },
    { href: "/capabilities",     label: "Capabilities" },
  ];
  const aiSystem = [
    { href: "/ai-review", label: "Prepare AI review" },
    { href: "/ai-import", label: "Import AI assessment" },
  ];
  const utilities = [
    { href: "/search",   label: "Search" },
    { href: "/settings", label: "Settings" },
  ];

  /* ── Shared nav link style helper ── */
  const navLinkClass = (href: string) => {
    const isActive = pathname === href;
    return `relative h-full flex items-center px-4 text-base font-sans font-medium transition-colors ${
      isActive
        ? "text-[#EDEAE3]"
        : "text-[#8B8894] hover:text-[#EDEAE3]"
    }`;
  };

  /* ── Dropdown item helper ── */
  const dropdownItemClass = (href: string) =>
    `block text-[15px] font-sans px-3 py-2.5 rounded-md transition-colors ${
      pathname === href
        ? "text-[#EDEAE3] bg-[#C9A26D]/12 font-medium"
        : "text-[#8B8894] hover:text-[#EDEAE3] hover:bg-[#2A2934]/50"
    }`;

  const ActiveIndicator = () => (
    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9A26D]" />
  );

  return (
    <>
      <header
        style={{ height: 70 }}
        className="w-full shrink-0 bg-[#16151A] border-b border-[#2A2934] sticky top-0 z-50"
      >
        {/* ── Inner container: wider than page content for navigation breathing room ── */}
        <div className="w-full h-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 flex items-center justify-between relative">

          {/* 1. Left: Brand */}
          <div className="flex h-full items-center z-10">
            <Link
              href="/"
              className="font-display text-xl font-semibold text-[#EDEAE3] tracking-tight shrink-0 hover:text-[#C9A26D] transition-colors"
            >
              Capability OS
            </Link>
          </div>

          {/* 3. Right: Desktop More + Mobile trigger */}
          <div className="flex items-center gap-2 md:gap-6 z-10">
            {/* More trigger */}
            <div className="hidden md:flex relative h-full items-center" ref={moreRef}>
              <button
                type="button"
                aria-label="More"
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((v) => !v)}
                className={`h-full flex items-center px-2 transition-colors bg-transparent border-none cursor-pointer relative ${
                  isMoreActive || moreOpen
                    ? "text-[#EDEAE3]"
                    : "text-[#8B8894] hover:text-[#EDEAE3]"
                }`}
              >
                <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {moreOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
                {isMoreActive && <ActiveIndicator />}
              </button>

              {/* Dropdown - No shadow, uses surface-raised */}
              {moreOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-1 w-60 bg-[#232229] border border-[#2A2934] rounded-lg py-1.5 px-1.5 z-50 shadow-none"
                >
                  {/* Primary */}
                  <div className="px-3 pt-2 pb-1.5 text-[13px] font-sans font-medium text-[#8B8894] tracking-wider uppercase select-none">
                    Primary
                  </div>
                  {[
                    { href: "/",         label: "Today" },
                    { href: "/calendar", label: "Calendar" },
                    { href: "/timeline", label: "Timeline" },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} role="menuitem" className={dropdownItemClass(item.href)}>
                      {item.label}
                    </Link>
                  ))}

                  <div className="my-1.5 mx-2 h-px bg-[#2A2934]/60" />

                  {/* Modules */}
                  <div className="px-3 pt-2 pb-1.5 text-[13px] font-sans font-medium text-[#8B8894] tracking-wider uppercase select-none">
                    Modules
                  </div>
                  {modules.map((item) => (
                    <Link key={item.href} href={item.href} role="menuitem" className={dropdownItemClass(item.href)}>
                      {item.label}
                    </Link>
                  ))}

                  <div className="my-1.5 mx-2 h-px bg-[#2A2934]/60" />

                  {/* AI System */}
                  <div className="px-3 pt-1.5 pb-1.5 text-[13px] font-sans font-medium text-[#8B8894] tracking-wider uppercase select-none">
                    AI System
                  </div>
                  {aiSystem.map((item) => (
                    <Link key={item.href} href={item.href} role="menuitem" className={dropdownItemClass(item.href)}>
                      {item.label}
                    </Link>
                  ))}

                  <div className="my-1.5 mx-2 h-px bg-[#2A2934]/60" />

                  {/* Utilities */}
                  {utilities.map((item) => (
                    <Link key={item.href} href={item.href} role="menuitem" className={dropdownItemClass(item.href)}>
                      {item.label}
                    </Link>
                  ))}

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="block w-full text-left text-[15px] font-sans px-3 py-2.5 rounded-md text-[#5C5A66] hover:text-[#B0715A] hover:bg-[#2A2934]/50 transition-colors cursor-pointer"
                  >
                    {loggingOut ? "Logging out…" : "Log out"}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 -mr-2 text-[#8B8894] hover:text-[#EDEAE3] rounded-[6px] transition-colors"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer (Fullscreen overlay below header) ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[70px] bottom-0 z-40 bg-[#16151A]/95 backdrop-blur-sm">
          <nav className="h-full overflow-y-auto px-6 py-6 pb-20 space-y-6">
            {/* Primary */}
            <div className="space-y-1">
              {[
                { href: "/",         label: "Today" },
                { href: "/calendar", label: "Calendar" },
                { href: "/timeline", label: "Timeline" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block py-2 text-[15px] font-sans ${
                    pathname === item.href
                      ? "text-[#EDEAE3] font-medium"
                      : "text-[#8B8894]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            <div className="h-px w-full bg-[#2A2934]/60" />

            {/* Modules */}
            <div className="space-y-2">
              <div className="text-xs font-sans font-medium text-[#8B8894] tracking-widest uppercase">
                Modules
              </div>
              <div className="space-y-1">
                {modules.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block py-2 text-[15px] font-sans ${
                      pathname === item.href
                        ? "text-[#EDEAE3] font-medium"
                        : "text-[#8B8894]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-px w-full bg-[#2A2934]/60" />

            {/* AI + Utilities */}
            <div className="space-y-2">
              <div className="text-xs font-sans font-medium text-[#8B8894] tracking-widest uppercase">
                AI System & Settings
              </div>
              <div className="space-y-1">
                {[...aiSystem, ...utilities].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block py-2 text-[15px] font-sans ${
                      pathname === item.href
                        ? "text-[#EDEAE3] font-medium"
                        : "text-[#8B8894]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="block w-full text-left py-2 mt-4 text-[15px] font-sans text-[#5C5A66] hover:text-[#B0715A]"
              >
                {loggingOut ? "Logging out…" : "Log out"}
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
