import Link from "next/link";

interface HeaderAction {
  href: string;
  label: string;
  tone?: "primary" | "secondary";
}

interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: HeaderAction;
  secondaryAction?: HeaderAction;
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}: AdminPageHeaderProps) {
  return (
    <section className="admin-page-hero admin-panel">
      <div className="admin-page-hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="admin-page-title">{title}</h1>
        <p className="admin-page-description">{description}</p>
      </div>
      <div className="admin-page-actions">
        {secondaryAction ? (
          <Link
            className={secondaryAction.tone === "primary" ? "primary-pill" : "secondary-pill"}
            href={secondaryAction.href}
          >
            {secondaryAction.label}
          </Link>
        ) : null}
        {primaryAction ? (
          <Link
            className={primaryAction.tone === "secondary" ? "secondary-pill" : "primary-pill"}
            href={primaryAction.href}
          >
            {primaryAction.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
