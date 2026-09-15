interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '28px',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            marginBottom: '4px',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{subtitle}</p>
        )}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}

// ── Page content wrapper ──────────────────────────────────────

interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
      className="animate-fade-in"
    >
      {children}
    </div>
  );
}
