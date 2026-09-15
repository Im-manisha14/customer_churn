import type { RiskLevel } from '../../types';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: { value: number; label: string };
  isDemo?: boolean;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  iconBg = '#eef2ff',
  iconColor = '#4f46e5',
  trend,
  isDemo,
}: KPICardProps) {
  return (
    <div
      className="card"
      style={{ padding: '20px 24px', position: 'relative', overflow: 'hidden' }}
    >
      {isDemo && (
        <span className="demo-badge" style={{ position: 'absolute', top: '12px', right: '12px' }}>
          Demo
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: iconColor,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '4px' }}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: trend.value >= 0 ? '#ef4444' : '#10b981',
                }}
              >
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Risk Badge ────────────────────────────────────────────────

interface RiskBadgeProps {
  risk: RiskLevel;
  size?: 'sm' | 'md';
}

const RISK_STYLES: Record<RiskLevel, { bg: string; color: string; dot: string }> = {
  High:   { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
  Medium: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  Low:    { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
};

export function RiskBadge({ risk, size = 'md' }: RiskBadgeProps) {
  const s = RISK_STYLES[risk];
  const pad = size === 'sm' ? '2px 8px' : '3px 10px';
  const fs = size === 'sm' ? '0.7rem' : '0.75rem';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: pad,
        background: s.bg,
        color: s.color,
        borderRadius: '999px',
        fontSize: fs,
        fontWeight: 600,
      }}
    >
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {risk} Risk
    </span>
  );
}

// ── Section Header ────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  isDemo?: boolean;
}

export function SectionHeader({ title, subtitle, isDemo }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: subtitle ? '4px' : 0 }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{title}</h2>
        {isDemo && <span className="demo-badge">Demo Data</span>}
      </div>
      {subtitle && <p style={{ color: '#64748b', fontSize: '0.82rem' }}>{subtitle}</p>}
    </div>
  );
}
