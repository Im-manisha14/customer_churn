import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { PageContainer, PageHeader } from '../components/layout/PageHeader';
import { SectionHeader } from '../components/ui/KPICard';
import { ChartSkeleton, ErrorState, Skeleton } from '../components/ui/States';
import {
  getModelMetrics, getConfusionMatrix, getRocCurve, getPrCurve,
} from '../services/api';
import { computeThresholdMetrics } from '../services/mockData';
import type {
  ModelMetrics, ConfusionMatrixData, RocCurvePoint, PrCurvePoint, ThresholdMetrics,
} from '../types';

// ── Metric Card ───────────────────────────────────────────────

function MetricCard({ label, value, description, highlight }: {
  label: string; value: string; description?: string; highlight?: boolean;
}) {
  return (
    <div style={{
      padding: '16px 18px',
      background: highlight ? '#eef2ff' : '#f8fafc',
      border: `1px solid ${highlight ? '#c7d2fe' : '#e2e8f0'}`,
      borderRadius: '10px',
    }}>
      <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
        {label}
      </p>
      <p style={{ fontSize: '1.6rem', fontWeight: 800, color: highlight ? '#4f46e5' : '#0f172a', letterSpacing: '-0.03em', marginBottom: '2px' }}>
        {value}
      </p>
      {description && <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{description}</p>}
    </div>
  );
}

// ── Confusion Matrix ──────────────────────────────────────────

function ConfusionMatrixViz({ data }: { data: ConfusionMatrixData }) {
  const cells = [
    { label: 'True Negative', value: data.tn, bg: '#d1fae5', color: '#065f46', desc: 'Correctly predicted: Retained' },
    { label: 'False Positive', value: data.fp, bg: '#fef3c7', color: '#92400e', desc: 'Predicted churn, actually stayed' },
    { label: 'False Negative', value: data.fn, bg: '#fee2e2', color: '#b91c1c', desc: 'Predicted stayed, actually churned' },
    { label: 'True Positive', value: data.tp, bg: '#dbeafe', color: '#1e40af', desc: 'Correctly predicted: Churned' },
  ];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        {cells.map((c) => (
          <div key={c.label} style={{ padding: '14px', background: c.bg, borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: c.color }}>{c.value.toLocaleString()}</p>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: c.color, marginBottom: '2px' }}>{c.label}</p>
            <p style={{ fontSize: '0.7rem', color: '#64748b' }}>{c.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
        <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>← Predicted: No Churn</p>
        <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Predicted: Churn →</p>
      </div>
    </div>
  );
}

// ── Chart tooltip ─────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      {label !== undefined && <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: '0.875rem', fontWeight: 600, color: p.color || '#0f172a' }}>
          {p.name}: {(+p.value).toFixed(3)}
        </p>
      ))}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────

export function ModelPerformance() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [cm, setCm] = useState<ConfusionMatrixData | null>(null);
  const [roc, setRoc] = useState<RocCurvePoint[]>([]);
  const [pr, setPr] = useState<PrCurvePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(0.50);
  const [thresholdMetrics, setThresholdMetrics] = useState<ThresholdMetrics>(computeThresholdMetrics(0.50));

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, c, r, p] = await Promise.all([
        getModelMetrics(), getConfusionMatrix(), getRocCurve(), getPrCurve(),
      ]);
      setMetrics(m); setCm(c); setRoc(r); setPr(p);
    } catch {
      setError('Failed to load model performance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleThresholdChange = (v: number) => {
    setThreshold(v);
    setThresholdMetrics(computeThresholdMetrics(v));
  };

  if (error) return <PageContainer><ErrorState message={error} onRetry={load} /></PageContainer>;

  return (
    <PageContainer>
      <PageHeader
        title="Model Performance"
        subtitle="Technical evaluation of the XGBoost churn classification model."
      />

      {/* Model info banner */}
      <div className="card" style={{ padding: '16px 24px', marginBottom: '24px', background: '#0f172a', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Model</p>
              <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>XGBoost Classifier</p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Version</p>
              <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>v1.0</p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Dataset</p>
              <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>Telco Customer Churn</p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</p>
              <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>Production Ready</p>
            </div>
          </div>
          <span className="demo-badge">Demo Metrics — Replace with trained model results</span>
        </div>
      </div>

      {/* Metrics Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height="90px" borderRadius="10px" />)}
        </div>
      ) : metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <MetricCard label="Accuracy" value={`${(metrics.accuracy * 100).toFixed(1)}%`} description="Overall correct predictions" />
          <MetricCard label="Precision" value={`${(metrics.precision * 100).toFixed(1)}%`} description="Of predicted churners" />
          <MetricCard label="Recall" value={`${(metrics.recall * 100).toFixed(1)}%`} description="Actual churners caught" highlight />
          <MetricCard label="F1 Score" value={`${(metrics.f1Score * 100).toFixed(1)}%`} description="Harmonic mean" />
          <MetricCard label="ROC-AUC" value={`${(metrics.rocAuc * 100).toFixed(1)}%`} description="Area under ROC curve" />
          <MetricCard label="PR-AUC" value={`${(metrics.prAuc * 100).toFixed(1)}%`} description="Area under PR curve" />
        </div>
      )}

      {/* Why Recall */}
      <div style={{ padding: '14px 18px', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '10px', marginBottom: '24px', display: 'flex', gap: '10px' }}>
        <Info size={16} style={{ color: '#4f46e5', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '0.82rem', color: '#3730a3' }}>
          <strong>Why emphasize Recall?</strong> Failing to identify a customer who genuinely churns is more costly than contacting one who ultimately stays. A high-recall model minimizes missed churners, enabling proactive retention.
        </p>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Confusion Matrix */}
        {loading ? <ChartSkeleton height="260px" /> : cm && (
          <div className="card" style={{ padding: '20px 24px' }}>
            <SectionHeader title="Confusion Matrix" subtitle="Predictions at threshold = 0.50" isDemo />
            <ConfusionMatrixViz data={cm} />
          </div>
        )}

        {/* ROC Curve */}
        {loading ? <ChartSkeleton height="260px" /> : (
          <div className="card" style={{ padding: '20px 24px' }}>
            <SectionHeader title="ROC Curve" subtitle={`AUC = ${metrics ? (metrics.rocAuc).toFixed(3) : '—'}`} isDemo />
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={roc}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="fpr" tickFormatter={(v) => v.toFixed(1)} label={{ value: 'FPR', position: 'insideBottom', offset: -4, style: { fontSize: 11, fill: '#94a3b8' } }} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickFormatter={(v) => v.toFixed(1)} label={{ value: 'TPR', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine x={0} y={0} stroke="#e2e8f0" strokeDasharray="4 4" label={{ value: 'Random', position: 'right', style: { fontSize: 10, fill: '#94a3b8' } }} ifOverflow="extendDomain" segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} />
                <Line type="monotone" dataKey="tpr" name="TPR" stroke="#4f46e5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* PR Curve */}
      {loading ? <ChartSkeleton height="220px" /> : (
        <div className="card" style={{ padding: '20px 24px', marginBottom: '16px' }}>
          <SectionHeader title="Precision-Recall Curve" subtitle={`PR-AUC = ${metrics ? (metrics.prAuc).toFixed(3) : '—'}`} isDemo />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pr}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="recall" tickFormatter={(v) => v.toFixed(1)} label={{ value: 'Recall', position: 'insideBottom', offset: -4, style: { fontSize: 11, fill: '#94a3b8' } }} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tickFormatter={(v) => v.toFixed(1)} label={{ value: 'Precision', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0.265} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Baseline (class freq)', position: 'right', style: { fontSize: 10, fill: '#94a3b8' } }} />
              <Line type="monotone" dataKey="precision" name="Precision" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Threshold Slider */}
      <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <SectionHeader title="Classification Threshold Simulator" />
          <span className="demo-badge" style={{ marginBottom: '16px' }}>Demo Visualization</span>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
              Decision Threshold
            </label>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4f46e5' }}>
              {threshold.toFixed(2)}
            </span>
          </div>
          <input
            type="range" min={0.1} max={0.9} step={0.01} value={threshold}
            onChange={(e) => handleThresholdChange(+e.target.value)}
            style={{ width: '100%', accentColor: '#4f46e5' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>0.10 (Aggressive)</span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>0.90 (Conservative)</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <div style={{ padding: '14px', background: '#eef2ff', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4f46e5' }}>{(thresholdMetrics.precision * 100).toFixed(1)}%</p>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Precision</p>
          </div>
          <div style={{ padding: '14px', background: '#d1fae5', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#065f46' }}>{(thresholdMetrics.recall * 100).toFixed(1)}%</p>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Recall</p>
          </div>
          <div style={{ padding: '14px', background: '#fef3c7', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#92400e' }}>{thresholdMetrics.falsePositives.toLocaleString()}</p>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>False Positives</p>
          </div>
          <div style={{ padding: '14px', background: '#fee2e2', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b91c1c' }}>{thresholdMetrics.falseNegatives.toLocaleString()}</p>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>False Negatives</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
