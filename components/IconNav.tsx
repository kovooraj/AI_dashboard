import { Zap, LayoutDashboard, Activity, Settings } from 'lucide-react';

export function IconNav() {
  return (
    <nav
      className="flex flex-col items-center py-4 gap-2 flex-shrink-0"
      style={{
        width: 52,
        background: 'var(--dash-sidebar)',
        borderRight: '1px solid var(--dash-border)',
        height: '100vh',
      }}
    >
      {/* Brand */}
      <div
        className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
        style={{ background: 'var(--dash-blue)' }}
      >
        <Zap size={15} color="#0a0b0f" strokeWidth={2.5} />
      </div>

      <NavIcon icon={<LayoutDashboard size={17} />} label="Dashboard" active />
      <NavIcon icon={<Activity size={17} />} label="Activity" />
      <NavIcon icon={<Settings size={17} />} label="Settings" />
    </nav>
  );
}

function NavIcon({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
      style={{
        color: active ? 'var(--dash-blue)' : 'var(--dash-muted)',
        background: active ? 'rgba(99,179,237,0.12)' : 'transparent',
      }}
    >
      {icon}
    </button>
  );
}
