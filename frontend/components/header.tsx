"use client";

import * as React from "react";
import Image from 'next/image'

const NAV = [
  { href: "#participants", label: "Учасники" },
  { href: "#about", label: "Про нас" },
  { href: "#join", label: "Долучитись" },
];

export function Header() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-24 max-w-5xl items-center justify-between px-5">
        <a href="#top" className="font-semibold tracking-tight">
          <Image
              src="/logo.png"
              width={50}
              height={50}
              alt="Logo"
          />
        </a>

        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="hover:text-foreground">
              {n.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Меню"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="-mr-2 grid size-9 place-items-center rounded-md md:hidden"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-5 py-3 md:hidden">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-base hover:bg-white/5"
            >
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
