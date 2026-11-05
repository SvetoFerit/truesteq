/** Callout for “app vs production” teach text on Agent / Provider / home. */
export const SimplificationNote = ({
  title = "Simplified in this prototype",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => {
  return (
    <aside className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--wash)]/70 px-4 py-3 text-sm text-[var(--ink)]/90 leading-relaxed">
      <p className="font-medium text-[var(--accent-deep)] mb-1.5">{title}</p>
      <div className="text-[var(--muted)] space-y-2">{children}</div>
    </aside>
  );
};
