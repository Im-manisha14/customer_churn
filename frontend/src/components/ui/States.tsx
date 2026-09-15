// ── Skeleton Loaders ──────────────────────────────────────────

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = '16px', borderRadius = '6px', style }: SkeletonProps) {
  return (
    <div
      className="animate-pulse-soft"
      style={{
        width,
        height,
        borderRadius,
        background: '#e2e8f0',
        ...style,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
        <Skeleton width="44px" height="44px" borderRadius="10px" />
        <div style={{ flex: 1 }}>
          <Skeleton height="12px" width="60%" style={{ marginBottom: '8px' }} />
          <Skeleton height="28px" width="45%" />
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = '220px' }: { height?: string }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <Skeleton height="14px" width="40%" style={{ marginBottom: '6px' }} />
      <Skeleton height="12px" width="65%" style={{ marginBottom: '20px' }} />
      <Skeleton height={height} borderRadius="8px" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
        <Skeleton height="14px" width="30%" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            gap: '16px',
          }}
        >
          <Skeleton height="12px" width="15%" />
          <Skeleton height="12px" width="10%" />
          <Skeleton height="12px" width="18%" />
          <Skeleton height="12px" width="12%" />
          <Skeleton height="12px" width="20px" borderRadius="999px" />
        </div>
      ))}
    </div>
  );
}

// ── Error State ───────────────────────────────────────────────

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Failed to load data', onRetry }: ErrorStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        color: '#64748b',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          fontSize: '1.5rem',
        }}
      >
        ⚠
      </div>
      <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Something went wrong</p>
      <p style={{ fontSize: '0.875rem', marginBottom: '20px' }}>{message}</p>
      {onRetry && (
        <button className="btn-secondary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
}

export function EmptyState({ title, description, icon = '📭' }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        color: '#64748b',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{icon}</div>
      <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>{title}</p>
      {description && <p style={{ fontSize: '0.875rem' }}>{description}</p>}
    </div>
  );
}

// ── Info Tooltip ──────────────────────────────────────────────

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }} title={text}>
      {children}
    </span>
  );
}
