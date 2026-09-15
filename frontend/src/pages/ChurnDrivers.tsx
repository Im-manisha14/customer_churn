import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { PageContainer, PageHeader } from '../components/layout/PageHeader';
import { SectionHeader } from '../components/ui/KPICard';
import { ChartSkeleton, ErrorState } from '../components/ui/States';
import { getChurnDrivers } from '../services/api';
import type { ChurnDriver } from '../types';

// ── Custom Tooltip ────────────────────────────────────────────

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d: ChurnDriver = payload[0]?.payload;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', maxWidth: '260px' }}>
      <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{d?.displayName}</p>
      <p style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 600, marginBottom: '6px' }}>
        Importance: {((payload[0].value || 0) * 100).toFixed(1)}%
      </p>
      <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{d?.description}</p>
    </div>
  );
};

// ── Insight Card ──────────────────────────────────────────────

function InsightCard({ title, body, index }: { title: string; body: string; index: number }) {
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const bgs = ['#eef2ff', '#d1fae5', '#fef3c7', '#fee2e2', '#ede9fe'];
  const color = colors[index % colors.length];
  const bg = bgs[index % bgs.length];
  return (
    <div style={{ padding: '16px', border: `1px solid ${bg}`, borderLeft: `3px solid ${color}`, borderRadius: '8px', background: '#fafafa' }}>
      <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '6px', fontSize: '0.875rem' }}>{title}</p>
      <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

const KEY_INSIGHTS = [
  {
    title: 'Month-to-month contracts drive the most churn',
    body: 'Customers on month-to-month contracts churn at ~43% — more than 15× the rate of two-year contract holders. Contract type is the strongest predictor in this dataset.',
  },
  {
    title: 'Short-tenure customers require early intervention',
    body: 'Customers in their first 6 months show a churn rate near 47%. Early engagement programs and onboarding support can significantly reduce churn in this segment.',
  },
  {
    title: 'Higher monthly charges are associated with elevated churn',
    body: 'Customers paying above $80/month show substantially higher churn risk. This may reflect dissatisfaction with perceived value or competition from alternative providers.',
  },
  {
    title: 'Fiber optic customers are at higher risk despite premium service',
    body: 'Fiber optic users churn at notably higher rates than DSL subscribers. This may indicate price sensitivity or service quality issues unique to this segment.',
  },
  {
    title: 'Electronic check users show the highest churn among payment methods',
    body: 'Customers paying via electronic check exhibit higher churn rates compared to automatic payment users, possibly reflecting lower commitment or engagement levels.',
  },
];

export function ChurnDrivers() {
  const [drivers, setDrivers] = useState<ChurnDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getChurnDrivers();
      setDrivers(data);
    } catch {
      setError('Failed to load churn drivers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (error) return <PageContainer><ErrorState message={error} onRetry={load} /></PageContainer>;

  const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#ddd6fe', '#ede9fe', '#d1fae5', '#d1fae5'];

  return (
    <PageContainer>
      <PageHeader
        title="Churn Drivers"
        subtitle="Understand which customer characteristics contribute most to churn probability."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Feature Importance Chart */}
        <div>
          {loading ? <ChartSkeleton height="420px" /> : (
            <div className="card" style={{ padding: '24px' }}>
              <SectionHeader
                title="Global Feature Importance"
                subtitle="Relative importance of each feature in the XGBoost model"
                isDemo
              />
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={drivers} layout="vertical" barSize={22} margin={{ right: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    domain={[0, 0.35]}
                  />
                  <YAxis
                    type="category"
                    dataKey="displayName"
                    tick={{ fontSize: 12, fill: '#374151' }}
                    width={130}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="importance" name="Importance" radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (v: any) => `${(Number(v) * 100).toFixed(1)}%`, style: { fontSize: 11, fill: '#64748b' } }}>
                    {drivers.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Key Insights + Driver Details */}
        <div>
          {/* Ranked list */}
          {!loading && (
            <div className="card" style={{ padding: '20px 24px', marginBottom: '16px' }}>
              <SectionHeader title="Top 5 Churn Drivers" isDemo />
              {drivers.slice(0, 5).map((d, i) => (
                <div key={d.feature} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: '#eef2ff', color: '#4f46e5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0f172a' }}>{d.displayName}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5' }}>{(d.importance * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px' }}>
                      <div style={{ height: '100%', width: `${(d.importance / 0.35) * 100}%`, background: '#4f46e5', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Key Insights */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <SectionHeader title="Key Insights" subtitle="Observed patterns — confirm with statistical tests on full dataset" isDemo />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {KEY_INSIGHTS.map((insight, i) => (
                <InsightCard key={i} index={i} title={insight.title} body={insight.body} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
