import { Header } from "@/components/header";
import { Participants } from "@/components/participants";

export default function Home() {
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
            <a
              href="#participants"
              className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
            >
              Учасники
            </a>
            <a
              href="#about"
              className="inline-flex h-10 items-center rounded-full border border-white/15 px-5 text-sm hover:bg-white/5"
            >
              Про проєкт
            </a>
          </div>
        </section>

        <div className="border-t border-white/10" />

        <Participants />

        <section
          id="about"
          className="border-t border-white/10 scroll-mt-20"
        >
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

        <section
          id="join"
          className="border-t border-white/10 scroll-mt-20"
        >
          <div className="mx-auto max-w-5xl px-5 py-16 md:py-20">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Долучитись
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Озвучуєш, перекладаєш або зводиш звук? Реєструйся і створюй свою анкету.
            </p>
            <a
              href="#blank"
              className="mt-6 inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
            >
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
