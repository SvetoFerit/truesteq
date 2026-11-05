/** Shared chrome for Overview / Agent / Provider — fictional NordFund Agent Commerce brand. */
import Link from "next/link";

const links = [
  { href: "/", label: "Overview" },
  { href: "/agent", label: "Agent Console" },
  { href: "/provider", label: "Provider & HITL" },
];

export const AppShell = ({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) => {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-[var(--line)] bg-[var(--panel)]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-baseline gap-2 no-underline">
            <span className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)]">
              NordFund
            </span>
            <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Agent Commerce
            </span>
          </Link>

          <nav className="flex flex-wrap gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm text-[var(--ink)]/80 hover:text-[var(--ink)] hover:bg-[var(--wash)] rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl text-[var(--ink)] tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-[var(--muted)] leading-relaxed">
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </main>

      <footer className="border-t border-[var(--line)] py-4 text-center text-xs text-[var(--muted)]">
        TRUSTEQ case prototype · fictional brand · not production software
      </footer>
    </div>
  );
};
