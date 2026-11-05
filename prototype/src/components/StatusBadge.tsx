/** Color chip for onboarding status / policy outcome / claim source / HITL ticket status. */
const BADGE_TONES: Record<string, string> = {
  collecting: "bg-sky-50 text-sky-800",
  policy_review: "bg-amber-50 text-amber-900",
  awaiting_human: "bg-orange-50 text-orange-900",
  awaiting_step_up: "bg-violet-50 text-violet-900",
  completed: "bg-emerald-50 text-emerald-900",
  rejected: "bg-rose-50 text-rose-900",
  open: "bg-orange-50 text-orange-900",
  approved: "bg-emerald-50 text-emerald-900",
  allow_auto: "bg-emerald-50 text-emerald-900",
  require_human: "bg-orange-50 text-orange-900",
  require_step_up: "bg-violet-50 text-violet-900",
  agent_asserted: "bg-amber-50 text-amber-900",
  system_verified: "bg-emerald-50 text-emerald-900",
  human_confirmed: "bg-sky-50 text-sky-900",
};

export const StatusBadge = ({ value }: { value: string }) => {
  const tone = BADGE_TONES[value] ?? "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium tracking-wide ${tone}`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
};
