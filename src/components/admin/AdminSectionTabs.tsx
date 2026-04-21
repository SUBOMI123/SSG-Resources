import Link from "next/link";

interface SectionTab {
  href: string;
  label: string;
  active?: boolean;
}

interface AdminSectionTabsProps {
  tabs: SectionTab[];
}

export function AdminSectionTabs({ tabs }: AdminSectionTabsProps) {
  return (
    <div className="admin-section-tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={tab.active ? "admin-section-tab active" : "admin-section-tab"}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
