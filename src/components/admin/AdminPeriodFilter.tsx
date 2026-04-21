import Link from "next/link";

import type { PaymentMonthOption, PaymentPeriod, PaymentRange } from "@/lib/payments";

const QUICK_OPTIONS: Array<{ value: PaymentPeriod; label: string }> = [
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "this-year", label: "This year" },
  { value: "all", label: "All time" },
];

type AdminPeriodFilterProps = {
  action: string;
  current: PaymentRange;
  monthOptions: PaymentMonthOption[];
};

export function AdminPeriodFilter({ action, current, monthOptions }: AdminPeriodFilterProps) {
  return (
    <section className="admin-period-filter admin-panel">
      <div className="admin-period-copy">
        <p className="eyebrow">Date view</p>
        <h2 className="admin-period-title">Choose what period you want to check</h2>
        <p className="admin-period-description">Use the quick options for common checks, or pick a specific month when you need exact figures.</p>
      </div>

      <div className="admin-period-controls">
        <div className="admin-filter-strip">
          <span className="admin-filter-label">Quick view:</span>
          <div className="admin-filter-options">
            {QUICK_OPTIONS.map((option) => (
              <Link
                key={option.value}
                href={`${action}?period=${option.value}`}
                className={current.period === option.value ? "admin-filter-chip active" : "admin-filter-chip"}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>

        <form action={action} className="admin-month-picker" method="get">
          <input name="period" type="hidden" value="month" />
          <label className="admin-month-field">
            <span>Choose month</span>
            <select defaultValue={current.period === "month" && current.month ? current.month : monthOptions[0]?.value} name="month">
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button className="secondary-pill" type="submit">
            Open month
          </button>
        </form>
      </div>
    </section>
  );
}
