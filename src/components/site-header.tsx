"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { SdeMark } from "@/components/sde-mark";
import { navLinks, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const firstNavRef = useRef<HTMLAnchorElement>(null);

  // scroll state: chrome bg after 24px; hide on scroll-down (mobile), show on up
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    let prev = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        el.toggleAttribute("data-scrolled", y > 24);
        if (y > prev && y > 80 && !open) el.setAttribute("data-hidden", "");
        else el.removeAttribute("data-hidden");
        prev = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [open]);

  // close mobile menu on route change
  useEffect(() => setOpen(false), [pathname]);

  // Esc closes, focus management
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    // Move focus to first nav link when opened (a11y)
    firstNavRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // lock scroll when menu open — work with Lenis
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header ref={headerRef} className="site-header" style={{ borderRadius: 0 }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label={`${site.name} home`}
        >
          <SdeMark className="brand-mark size-10 shrink-0" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[0.95rem] font-bold tracking-tight">Sri Divya</span>
            <span className="text-[0.6rem] font-medium uppercase tracking-[0.18em] text-text-dim">
              Enterprises
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {navLinks.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className="nav-link"
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/quote" className="btn btn-primary hidden h-11 sm:inline-flex">
            Get a Quote
          </Link>
          <button
            ref={menuBtnRef}
            type="button"
            className="btn btn-steel size-11 px-0 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* mobile nav sheet — animated */}
      <div
        id="mobile-nav"
        className={cn(
          "border-t border-line/60 px-4 pb-6 pt-3 md:hidden",
          open ? "mobile-nav-anim block" : "hidden"
        )}
        style={{
          background: "oklch(0.16 0.014 260 / 0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <nav className="grid gap-1" aria-label="Primary mobile">
          {navLinks.map((l, i) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                ref={i === 0 ? firstNavRef : undefined}
                href={l.href}
                className="mobile-nav-link"
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
          <Link href="/quote" className="btn btn-primary mt-3 w-full">
            Get a Quote
          </Link>
        </nav>
      </div>
    </header>
  );
}
