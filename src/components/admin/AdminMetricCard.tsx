interface AdminMetricCardProps {
  label: string;
  value: string;
  tone?: "default" | "accent" | "success" | "warning";
}

export function AdminMetricCard({
  label,
  value,
  tone = "default",
}: AdminMetricCardProps) {
  return (
    <article className={`admin-stat-card admin-stat-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
