import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts';
import { PageContainer, PageHeader } from '../components/layout/PageHeader';
import { KPICard, SectionHeader } from '../components/ui/KPICard';
import { ChartSkeleton } from '../components/ui/States';
import { getThresholdComparison } from '../services/api';
import type { ThresholdComparisonRow } from '../types';
import { AlertTriangle, Users, DollarSign, TrendingUp } from 'lucide-react';

// ── Chart tooltip ─────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Threshold: {label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: '0.8rem', color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? `$${p.value.toLocaleString()}` : p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

// ── Number Input ──────────────────────────────────────────────

function InputRow({ label, value, onChange, prefix, suffix, min, max, step, hint }: {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; suffix?: string; min?: number; max?: number; step?: number; hint?: string;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#374151', marginBottom: '5px' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
        {prefix && <span style={{ padding: '8px 10px', background: '#f8fafc', color: '#64748b', borderRight: '1px solid #e2e8f0', fontSize: '0.875rem' }}>{prefix}</span>}
        <input
          type="number" min={min} max={max} step={step ?? 1} value={value}
          onChange={(e) => onChange(+e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 12px', fontSize: '0.875rem', color: '#0f172a' }}
        />
        {suffix && <span style={{ padding: '8px 10px', background: '#f8fafc', color: '#64748b', borderLeft: '1px solid #e2e8f0', fontSize: '0.875rem' }}>{suffix}</span>}
      </div>
      {hint && <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px' }}>{hint}</p>}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export function BusinessImpact() {
  const [lifetimeValue, setLifetimeValue] = useState(300);
  const [retentionCost, setRetentionCost] = useState(20);
  const [successRate, setSuccessRate] = useState(30);
  const [comparison, setComparison] = useState<ThresholdComparisonRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadComparison = async () => {
    setLoading(true);
    try {
      const data = await getThresholdComparison({ customerLifetimeValue: lifetimeValue, retentionOfferCost: retentionCost, expectedRetentionSuccess: successRate });
      setComparison(data);
    } catch {
      // silent fail — demo
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComparison(); }, [lifetimeValue, retentionCost, successRate]);

  // Best row = max net benefit
  const bestRow = comparison.reduce((best, row) => row.netBenefit > (best?.netBenefit ?? -Infinity) ? row : best, comparison[0]);

  const fmt = (v: number) => v < 0 ? `-$${Math.abs(v).toLocaleString()}` : `$${v.toLocaleString()}`;

  return (
    <PageContainer>
      <PageHeader
        title="Retention & Business Impact"
        subtitle="Simulate the financial impact of retention campaigns at different churn thresholds."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Assumptions Panel */}
        <div>
          <div className="card" style={{ padding: '20px 24px', marginBottom: '16px' }}>
            <SectionHeader title="Assumptions" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <InputRow label="Customer Lifetime Value" value={lifetimeValue} onChange={setLifetimeValue} prefix="$" min={0} step={10} hint="Expected revenue from a retained customer" />
              <InputRow label="Retention Offer Cost" value={retentionCost} onChange={setRetentionCost} prefix="$" min={0} step={5} hint="Cost per customer targeted (outreach + incentive)" />
              <InputRow label="Retention Success Rate" value={successRate} onChange={setSuccessRate} suffix="%" min={0} max={100} step={1} hint="% of targeted at-risk customers retained" />
            </div>
            <div style={{ marginTop: '14px', padding: '10px 14px', background: '#fef3c7', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.75rem', color: '#92400e' }}>
                <strong>Demo values.</strong> Replace with your actual business metrics for accurate ROI projections.
              </p>
            </div>
          </div>

          {/* Formula explanation */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', marginBottom: '12px' }}>Calculation Logic</h3>
            {[
              { label: 'Customers Targeted', formula: 'Customers above selected threshold' },
              { label: 'Churners Captured', formula: 'Targeted × Recall at threshold' },
              { label: 'Value Protected', formula: 'Churners Captured × Success Rate × CLV' },
              { label: 'Retention Cost', formula: 'Customers Targeted × Offer Cost' },
              { label: 'Net Benefit', formula: 'Value Protected − Retention Cost' },
            ].map(({ label, formula }) => (
              <div key={label} style={{ marginBottom: '8px' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{label}</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{formula}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div>
          {/* KPI Cards */}
          {bestRow && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <KPICard title="High-Risk Customers" value="1,284" icon={<AlertTriangle size={18} />} iconBg="#fef3c7" iconColor="#f59e0b" isDemo />
              <KPICard title="Optimal Target" value={bestRow.customersTargeted.toLocaleString()} subtitle={`At threshold ${bestRow.threshold}`} icon={<Users size={18} />} iconBg="#eef2ff" iconColor="#4f46e5" isDemo />
              <KPICard title="Est. Retention Cost" value={fmt(bestRow.retentionCost)} icon={<DollarSign size={18} />} iconBg="#d1fae5" iconColor="#10b981" isDemo />
              <KPICard title="Est. Net Benefit" value={fmt(bestRow.netBenefit)} icon={<TrendingUp size={18} />} iconBg="#d1fae5" iconColor="#10b981" isDemo />
            </div>
          )}

          {/* Threshold Comparison Chart */}
          {loading ? <ChartSkeleton height="280px" /> : (
            <div className="card" style={{ padding: '20px 24px', marginBottom: '16px' }}>
              <SectionHeader title="Retention Targeting by Churn Threshold" subtitle="Compare cost vs. benefit at different model decision thresholds" isDemo />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparison.map((r) => ({ ...r, threshold: r.threshold.toFixed(2) }))} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="threshold" tick={{ fontSize: 12, fill: '#64748b' }} label={{ value: 'Churn Threshold', position: 'insideBottom', offset: -4, style: { fontSize: 11, fill: '#94a3b8' } }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : v.toString()} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '12px' }} />
                  <Bar dataKey="retentionCost" name="Retention Cost ($)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="valueProtected" name="Value Protected ($)" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="netBenefit" name="Net Benefit ($)" fill="#4f46e5" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Threshold Comparison Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>Threshold Comparison</h3>
              <span className="demo-badge">Demo Values</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Threshold</th>
                    <th>Targeted</th>
                    <th>Churners Captured</th>
                    <th>Retention Cost</th>
                    <th>Value Protected</th>
                    <th>Net Benefit</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.threshold} style={{ background: row === bestRow ? '#f0fdf4' : undefined }}>
                      <td style={{ fontWeight: 600, color: '#4f46e5' }}>
                        {row.threshold.toFixed(2)}
                        {row === bestRow && (
                          <span style={{ marginLeft: '6px', fontSize: '0.7rem', background: '#d1fae5', color: '#065f46', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Best</span>
                        )}
                      </td>
                      <td>{row.customersTargeted.toLocaleString()}</td>
                      <td>{row.expectedChurnersCaptures.toLocaleString()}</td>
                      <td>{fmt(row.retentionCost)}</td>
                      <td style={{ color: '#065f46' }}>{fmt(row.valueProtected)}</td>
                      <td style={{ fontWeight: 600, color: row.netBenefit >= 0 ? '#065f46' : '#b91c1c' }}>{fmt(row.netBenefit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost-sensitive note */}
          <div style={{ marginTop: '14px', padding: '14px 18px', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '10px', display: 'flex', gap: '10px' }}>
            <Info size={16} style={{ color: '#4f46e5', flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '0.82rem', color: '#3730a3' }}>
              <strong>Cost-sensitive ML thinking:</strong> Maximizing accuracy alone doesn't optimize business outcomes. The optimal threshold is where net benefit is maximized — which depends on your actual CLV, retention cost, and conversion rate assumptions.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
