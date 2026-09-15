import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, TrendingDown, AlertTriangle, DollarSign,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { PageContainer, PageHeader } from '../components/layout/PageHeader';
import { KPICard, RiskBadge, SectionHeader } from '../components/ui/KPICard';
import { ChartSkeleton, ErrorState } from '../components/ui/States';
import {
  getDashboardStats, getChurnByContract, getChurnByTenure,
  getRiskDistribution,
} from '../services/api';
import { MOCK_CUSTOMERS } from '../services/mockData';
import type {
  DashboardStats, ChurnByContractItem, ChurnByTenureItem, RiskDistributionItem,
} from '../types';

// ── Color palette ─────────────────────────────────────────────

const CHART_COLORS = {
  primary: '#4f46e5',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  muted: '#94a3b8',
};
const RISK_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

// ── Custom Tooltip ────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      {label && <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: '0.875rem', fontWeight: 600, color: p.color || '#0f172a' }}>
          {p.name}: {typeof p.value === 'number' && p.value < 2 ? `${(p.value * 100).toFixed(1)}%` : p.value}
        </p>
      ))}
    </div>
  );
};

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [byContract, setByContract] = useState<ChurnByContractItem[]>([]);
  const [byTenure, setByTenure] = useState<ChurnByTenureItem[]>([]);
  const [riskDist, setRiskDist] = useState<RiskDistributionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, c, t, r] = await Promise.all([
        getDashboardStats(), getChurnByContract(), getChurnByTenure(), getRiskDistribution(),
      ]);
      setStats(s); setByContract(c); setByTenure(t); setRiskDist(r);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const highRiskCustomers = MOCK_CUSTOMERS.filter((c) => c.riskLevel === 'High').slice(0, 8);

  if (error) return <PageContainer><ErrorState message={error} onRetry={load} /></PageContainer>;

  return (
    <PageContainer>
      <PageHeader
        title="Customer Churn Overview"
        subtitle="Monitor customer risk, churn trends, and retention opportunities."
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse-soft" style={{ height: '110px' }} />
          ))
        ) : (
          <>
            <KPICard title="Total Customers" value="7,043" subtitle="Telco dataset" icon={<Users size={20} />} iconBg="#eef2ff" iconColor="#4f46e5" isDemo />
            <KPICard title="Churn Rate" value="26.5%" subtitle="1,869 churned customers" icon={<TrendingDown size={20} />} iconBg="#fee2e2" iconColor="#ef4444" trend={{ value: 1.2, label: 'vs last quarter' }} isDemo />
            <KPICard title="High-Risk Customers" value="1,284" subtitle="Churn prob ≥ 60%" icon={<AlertTriangle size={20} />} iconBg="#fef3c7" iconColor="#f59e0b" isDemo />
            <KPICard title="Revenue at Risk" value="$184K" subtitle="Based on monthly charges" icon={<DollarSign size={20} />} iconBg="#d1fae5" iconColor="#10b981" isDemo />
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Churn by Contract */}
        {loading ? <ChartSkeleton /> : (
          <div className="card" style={{ padding: '20px 24px' }}>
            <SectionHeader title="Churn Rate by Contract Type" isDemo />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byContract} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="contract" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="churnRate" name="Churn Rate %" fill={CHART_COLORS.danger} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Churn by Tenure */}
        {loading ? <ChartSkeleton /> : (
          <div className="card" style={{ padding: '20px 24px' }}>
            <SectionHeader title="Churn Rate by Tenure Group" isDemo />
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={byTenure}>
                <defs>
                  <linearGradient id="tenureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="churnRate" name="Churn Rate %" stroke={CHART_COLORS.primary} fill="url(#tenureGrad)" strokeWidth={2} dot={{ fill: CHART_COLORS.primary, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>

        {/* Churn Distribution Pie */}
        {loading ? <ChartSkeleton /> : (
          <div className="card" style={{ padding: '20px 24px' }}>
            <SectionHeader title="Churn Distribution" isDemo />
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={[{ name: 'Retained', value: 5174 }, { name: 'Churned', value: 1869 }]} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    <Cell fill={CHART_COLORS.success} />
                    <Cell fill={CHART_COLORS.danger} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div>
                {[{ label: 'Retained', count: '5,174', color: CHART_COLORS.success }, { label: 'Churned', count: '1,869', color: CHART_COLORS.danger }].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.color, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.label}</p>
                      <p style={{ fontWeight: 700, color: '#0f172a' }}>{item.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Risk Distribution */}
        {loading ? <ChartSkeleton /> : (
          <div className="card" style={{ padding: '20px 24px' }}>
            <SectionHeader title="Customer Risk Distribution" isDemo />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskDist} layout="vertical" barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis type="category" dataKey="risk" tick={{ fontSize: 12, fill: '#64748b' }} width={60} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Customers" radius={[0, 4, 4, 0]}>
                  {riskDist.map((entry) => (
                    <Cell key={entry.risk} fill={RISK_COLORS[entry.risk]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent High-Risk Customers Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>Recent High-Risk Customers</h2>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>Customers with churn probability ≥ 60%</p>
          </div>
          <span className="demo-badge">Demo Data</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Tenure</th>
                <th>Contract</th>
                <th>Monthly Charges</th>
                <th>Churn Probability</th>
                <th>Risk</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {highRiskCustomers.map((c) => (
                <tr key={c.customerID}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>
                    {c.customerID}
                  </td>
                  <td>{c.tenure} mo</td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 500,
                      background: c.contract === 'Month-to-month' ? '#fee2e2' : c.contract === 'One year' ? '#fef3c7' : '#d1fae5',
                      color: c.contract === 'Month-to-month' ? '#b91c1c' : c.contract === 'One year' ? '#92400e' : '#065f46',
                    }}>
                      {c.contract}
                    </span>
                  </td>
                  <td>${c.monthlyCharges.toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', minWidth: '60px' }}>
                        <div style={{ height: '100%', width: `${(c.churnProbability ?? 0) * 100}%`, background: '#ef4444', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a', minWidth: '38px' }}>
                        {((c.churnProbability ?? 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td><RiskBadge risk={c.riskLevel ?? 'Low'} size="sm" /></td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                      onClick={() => navigate(`/predict?customer=${c.customerID}`)}
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
