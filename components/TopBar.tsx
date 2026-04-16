'use client';

export function TopBar() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        height: 40,
        borderBottom: '1px solid #1a2c1d',
        flexShrink: 0,
        background: '#080f09',
      }}
    >
      {/* Left: Dashboard name */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          borderRight: '1px solid #1a2c1d',
        }}
      >
        <span
          style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#e4ede6',
          }}
        >
          Automation Dashboard
        </span>
      </div>

      {/* Centre: Report name */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          borderRight: '1px solid #1a2c1d',
          flex: 1,
        }}
      >
        <span
          style={{
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#6a8870',
          }}
        >
          Alex Benchmark Report
        </span>
      </div>

      {/* Right-centre: AI Insights */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          borderRight: '1px solid #1a2c1d',
        }}
      >
        <span
          style={{
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#6a8870',
          }}
        >
          AI Insights
        </span>
      </div>

      {/* Far right: version */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
        }}
      >
        <span
          style={{
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#3dba62',
          }}
        >
          Version 1.0
        </span>
      </div>
    </div>
  );
}
