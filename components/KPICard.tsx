interface KPICardProps {
  value: string;
  label: string;
  sublabel?: string;
  color?: string;
  icon?: React.ReactNode;
}

export function KPICard({ value, label, sublabel, color, icon }: KPICardProps) {
  return (
    <div
      className="flex flex-col gap-1 rounded-lg px-4 py-3"
      style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-border)' }}
    >
      {icon && (
        <div className="mb-0.5" style={{ color: 'var(--dash-muted)' }}>
          {icon}
        </div>
      )}
      <p
        className="text-2xl font-bold tabular-nums leading-none tracking-tight"
        style={{ color: color ?? 'var(--dash-text)' }}
      >
        {value}
      </p>
      <p className="text-xs font-medium leading-none" style={{ color: 'var(--dash-muted)' }}>
        {label}
      </p>
      {sublabel && (
        <p className="text-xs leading-none" style={{ color: 'var(--dash-muted)', fontSize: '0.625rem', opacity: 0.7 }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}
