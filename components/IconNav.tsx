'use client';

export function IconNav() {
  return (
    <nav
      className="flex flex-col items-center py-5 gap-1 flex-shrink-0"
      style={{
        width: 52,
        background: 'var(--dash-sidebar)',
        borderRight: '1px solid var(--dash-border)',
        height: '100vh',
      }}
    >
      {/* Brand mark */}
      <div
        className="mb-5 flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
        style={{ background: 'var(--dash-blue)' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="#09090d" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="7" cy="7" r="2" fill="#09090d"/>
        </svg>
      </div>

      <NavBtn label="Dashboard" active>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
      </NavBtn>

      <NavBtn label="Activity">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <polyline points="1,9 4,5 7,8 10,3 13,6 15,4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </NavBtn>

      <NavBtn label="Settings">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M11.54 4.46l-1.41 1.41M4.95 11.54l-1.41 1.41" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </NavBtn>
    </nav>
  );
}

function NavBtn({
  children,
  label,
  active = false,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200"
      style={{
        color: active ? 'var(--dash-blue)' : 'var(--dash-muted)',
        background: active ? 'rgba(74,158,255,0.1)' : 'transparent',
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--dash-text)';
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--dash-muted)';
      }}
    >
      {children}
    </button>
  );
}
