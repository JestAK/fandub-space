"use client";

import * as React from "react";

type Role = "actor" | "translator" | "sound";

const ROLE_LABEL: Record<Role, string> = {
  actor: "Актор",
  translator: "Перекладач",
  sound: "Звук",
};

type Participant = {
  name: string;
  role: Role;
  bio: string;
  works: string[];
  contact: string;
};

const PEOPLE: Participant[] = [
  {
    name: "Оля Василенко",
    role: "actor",
    bio: "Голос для драм та аніме. У фандабі з 2019 року.",
    works: ["Demon Slayer", "Frieren", "Vinland Saga 2"],
    contact: "@olya_voice",
  },
  {
    name: "Андрій Коваль",
    role: "translator",
    bio: "Перекладач з японської та англійської.",
    works: ["Mushoku Tensei", "Bocchi the Rock!"],
    contact: "@andriy_tl",
  },
  {
    name: "Марта Шевченко",
    role: "sound",
    bio: "Зведення та мастеринг для серіалів.",
    works: ["Severance", "The Bear", "Arcane S2"],
    contact: "marta@fandub.space",
  },
  {
    name: "Петро Лисенко",
    role: "actor",
    bio: "Низький тембр, лиходії та головні ролі.",
    works: ["Vinland Saga", "Berserk 1997"],
    contact: "@petro_lys",
  },
  {
    name: "Катерина Бондар",
    role: "translator",
    bio: "Художній переклад фільмів та серіалів.",
    works: ["Better Call Saul", "Succession"],
    contact: "kateryna#0420",
  },
  {
    name: "Юра Білик",
    role: "sound",
    bio: "Запис та обробка діалогів.",
    works: ["Frieren", "Spy x Family"],
    contact: "@yura_snd",
  },
  {
    name: "Софія Мельник",
    role: "actor",
    bio: "Дитячі та підліткові ролі. Дубляж мультфільмів.",
    works: ["Bocchi the Rock!", "Wonder Egg Priority"],
    contact: "@sofia_v",
  },
  {
    name: "Володимир Ткач",
    role: "translator",
    bio: "Sci-fi, фентезі та технічна термінологія.",
    works: ["Foundation", "Andor"],
    contact: "vt@fandub.space",
  },
  {
    name: "Ірина Кравець",
    role: "sound",
    bio: "Sound design та монтаж повного метру.",
    works: ["The Brutalist", "Anora"],
    contact: "kravets.audio",
  },
];

const FILTERS: { id: "all" | Role; label: string }[] = [
  { id: "all", label: "Усі" },
  { id: "actor", label: "Актори" },
  { id: "translator", label: "Перекладачі" },
  { id: "sound", label: "Звук" },
];

export function Participants() {
  const [filter, setFilter] = React.useState<"all" | Role>("all");
  const list = filter === "all" ? PEOPLE : PEOPLE.filter((p) => p.role === filter);

  return (
    <section
      id="participants"
      className="mx-auto max-w-5xl scroll-mt-20 px-5 py-16 md:py-20"
    >
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
        Учасники
      </h2>
      <p className="mt-2 text-muted-foreground">
        Актори озвучення, перекладачі та звукорежисери.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={
                "h-8 rounded-full border px-3 text-sm transition-colors " +
                (active
                  ? "border-foreground bg-foreground text-background"
                  : "border-white/15 text-muted-foreground hover:text-foreground")
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <li
            key={p.name}
            className="flex flex-col gap-3 rounded-xl border border-white/10 p-5"
          >
            <div>
              <p className="text-xs text-muted-foreground">{ROLE_LABEL[p.role]}</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">
                {p.name}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">{p.bio}</p>
            <ul className="flex flex-wrap gap-1.5">
              {p.works.map((w) => (
                <li
                  key={w}
                  className="rounded-full border border-white/10 px-2 py-0.5 text-xs"
                >
                  {w}
                </li>
              ))}
            </ul>
            <a href="#" className="mt-1 text-sm hover:underline">
              {p.contact}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
