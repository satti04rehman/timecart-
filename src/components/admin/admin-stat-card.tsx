export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "admin-card border-champagne/50 bg-champagne/10 px-6 py-5 text-obsidian"
          : "admin-card px-6 py-5 text-obsidian"
      }
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-obsidian/55">
        {label}
      </p>
      <p className="admin-title mt-2 text-3xl text-obsidian">{value}</p>
      {sub && (
        <p className="mt-1 text-xs text-text-gray">
          {sub}
        </p>
      )}
    </div>
  );
}