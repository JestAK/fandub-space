"use client";

import * as React from "react";
import Image from 'next/image';

const NAV = [
  { href: "/#participants", label: "Учасники" },
  { href: "/#about", label: "Про нас" },
];

export function Header() {
  const [open, setOpen] = React.useState(false);
  const [isAuth, setIsAuth] = React.useState(false);

  React.useEffect(() => {
    setIsAuth(!!localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
  };

  return (
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-24 max-w-5xl items-center justify-between px-5">
          <a href="/" className="font-semibold tracking-tight">
            <Image src="/logo.png" width={50} height={50} alt="Logo" />
          </a>

          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex items-center">
            {NAV.map((n) => (
                <a key={n.href} href={n.href} className="hover:text-foreground">
                  {n.label}
                </a>
            ))}

            <div className="h-4 w-px bg-white/10" />

            {isAuth ? (
                <>
                  <a href="/profile" className="text-foreground font-medium hover:underline">Профіль</a>
                  <button onClick={handleLogout} className="text-destructive text-sm hover:underline cursor-pointer">
                    Вийти
                  </button>
                </>
            ) : (
                <>
                  <a href="/login" className="hover:text-foreground">Увійти</a>
                  <a href="/register" className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-xs font-medium text-background hover:opacity-90">
                    Реєстрація
                  </a>
                </>
            )}
          </nav>

          <button
              type="button"
              aria-label="Меню"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="-mr-2 grid size-9 place-items-center rounded-md md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        {open && (
            <nav className="flex flex-col gap-3 border-t border-white/10 bg-background p-5 md:hidden">
              {NAV.map((n) => (
                  <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">
                    {n.label}
                  </a>
              ))}
              <div className="h-px w-full bg-white/10 my-1" />
              {isAuth ? (
                  <>
                    <a href="/profile" className="text-sm font-medium text-foreground">Профіль</a>
                    <button onClick={handleLogout} className="text-left text-sm text-destructive">Вийти</button>
                  </>
              ) : (
                  <>
                    <a href="/login" className="text-sm text-muted-foreground">Увійти</a>
                    <a href="/register" className="text-sm text-muted-foreground">Реєстрація</a>
                  </>
              )}
            </nav>
        )}
      </header>
  );
}