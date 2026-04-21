interface AdminEmptyStateProps {
  title: string;
  body: string;
}

export function AdminEmptyState({ title, body }: AdminEmptyStateProps) {
  return (
    <div className="admin-empty-state admin-panel">
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}
