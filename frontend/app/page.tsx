"use client";

import * as React from "react";
import { Header } from "@/components/header";

export default function Home() {
  const [posts, setPosts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/posts`);
        if (!res.ok) throw new Error("Failed to load posts");

        const data = await res.json();
        setPosts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [BACKEND_URL]);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "actor": return "Актор озвучення";
      case "translator": return "Перекладач";
      case "sound": return "Звукорежисер";
      default: return role;
    }
  };

  return (
      <>
        <Header />
        <main id="top" className="flex-1 pt-14">
          <section className="mx-auto max-w-5xl px-5 py-20 md:py-28">
            <h1 className="max-w-2xl text-4xl leading-tight font-semibold tracking-tight md:text-5xl">
              Простір українського фандабу.
            </h1>
            <p className="mt-5 max-w-xl text-muted-foreground md:text-lg">
              Портфоліо-платформа для акторів, перекладачів та
              звукорежисерів. Профілі, роботи, контакти.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#participants" className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background hover:opacity-90">
                Учасники
              </a>
              <a href="#about" className="inline-flex h-10 items-center rounded-full border border-white/15 px-5 text-sm hover:bg-white/5">
                Про проєкт
              </a>
            </div>
          </section>

          <div className="border-t border-white/10" />

          <section id="participants" className="scroll-mt-20">
            <div className="mx-auto max-w-5xl px-5 py-16 md:py-20 flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Учасники спільноти</h2>
                <p className="text-sm text-muted-foreground mt-1">Останні опубліковані анкети та роботи портфоліо</p>
              </div>

              {loading && (
                  <div className="flex items-center justify-center py-20 text-muted-foreground">
                    Завантаження публікацій...
                  </div>
              )}

              {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg text-center">
                    {error}
                  </div>
              )}

              {!loading && !error && posts.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground border border-dashed border-white/10 rounded-xl">
                    Наразі немає опублікованих анкет.
                  </div>
              )}

              {!loading && !error && posts.length > 0 && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {posts.map((post: any) => (
                        <div key={post.id} className="rounded-xl border border-white/10 bg-card p-6 flex flex-col justify-between gap-4 transition-colors hover:border-white/15">
                          <div>
                            <h3 className="text-xl font-medium tracking-tight mb-2">{post.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
                          </div>

                          {post.User && (
                              <div className="border-t border-white/5 pt-4 flex items-center justify-between mt-2">
                                <div>
                                  <p className="text-sm font-medium text-foreground">{post.User.name}</p>
                                  <p className="text-xs text-muted-foreground">{getRoleLabel(post.User.role)}</p>
                                </div>
                              </div>
                          )}
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </section>

          <section id="about" className="border-t border-white/10 scroll-mt-20">
            <div className="mx-auto max-w-5xl px-5 py-16 md:py-20">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Про FanDub Space
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                Українська фандаб-спільнота велика, але розпорошена. FanDub Space
                збирає її в одному місці, щоб студії, режисери та автори
                знаходили одне одного.
              </p>
            </div>
          </section>

          <section id="join" className="border-t border-white/10 scroll-mt-20">
            <div className="mx-auto max-w-5xl px-5 py-16 md:py-20">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Долучитись
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Озвучуєш, перекладаєш або зводиш звук? Реєструйся і створюй свою анкету.
              </p>
              <a href="/register" className="mt-6 inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background hover:opacity-90">
                Зареєструватися
              </a>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} FanDub Space</p>
          </div>
        </footer>
      </>
  );
}