import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brain, ChevronRight, Info } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/layout/PageHeader';
import { RiskBadge, SectionHeader } from '../components/ui/KPICard';
import { ErrorState } from '../components/ui/States';
import { predictChurn, explainPrediction, generateRetentionRecommendation } from '../services/api';
import { MOCK_CUSTOMERS } from '../services/mockData';
import type {
  PredictionRequest, PredictionResponse, ExplanationResponse, RetentionRecommendation, RiskLevel,
} from '../types';

// ── Form default values ───────────────────────────────────────

const DEFAULTS: PredictionRequest = {
  customerID: '',
  gender: 'Male',
  seniorCitizen: 0,
  partner: 'No',
  dependents: 'No',
  tenure: 12,
  phoneService: 'Yes',
  multipleLines: 'No',
  internetService: 'Fiber optic',
  onlineSecurity: 'No',
  onlineBackup: 'No',
  deviceProtection: 'No',
  techSupport: 'No',
  streamingTV: 'No',
  streamingMovies: 'No',
  contract: 'Month-to-month',
  paperlessBilling: 'Yes',
  paymentMethod: 'Electronic check',
  monthlyCharges: 75.50,
  totalCharges: 906.00,
};

// ── Form Field Components ─────────────────────────────────────

function FormRow({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#374151', marginBottom: '5px' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px' }}>{hint}</p>}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '6px 12px', borderRadius: '6px', border: '1px solid',
        borderColor: value ? '#c7d2fe' : '#e2e8f0',
        background: value ? '#eef2ff' : '#f8fafc',
        color: value ? '#4f46e5' : '#64748b',
        fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <span style={{
        width: '34px', height: '18px', borderRadius: '9px',
        background: value ? '#4f46e5' : '#cbd5e1',
        position: 'relative', display: 'inline-block',
        transition: 'background 0.2s ease',
      }}>
        <span style={{
          position: 'absolute', top: '3px',
          left: value ? '17px' : '3px',
          width: '12px', height: '12px',
          borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s ease',
        }} />
      </span>
      {label ?? (value ? 'Yes' : 'No')}
    </button>
  );
}

// ── SHAP Chart Bar ────────────────────────────────────────────

function ShapBar({ feature, impact, displayName, value }: {
  feature: string; impact: number; displayName: string; value: string | number;
}) {
  const isPositive = impact > 0;
  const width = Math.min(95, Math.abs(impact) * 280);
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div>
          <span style={{ fontSize: '0.83rem', fontWeight: 500, color: '#0f172a' }}>{displayName}</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '6px' }}>= {value}</span>
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isPositive ? '#ef4444' : '#10b981' }}>
          {isPositive ? '+' : ''}{(impact * 100).toFixed(1)}%
        </span>
      </div>
      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${width}%`,
          background: isPositive ? '#ef4444' : '#10b981',
          borderRadius: '4px',
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

// ── Probability Gauge ─────────────────────────────────────────

function ProbabilityGauge({ probability }: { probability: number }) {
  const pct = probability * 100;
  const color = pct >= 60 ? '#ef4444' : pct >= 30 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>0% (Low)</span>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>100% (High)</span>
      </div>
      <div style={{ height: '14px', background: 'linear-gradient(to right, #d1fae5, #fef3c7, #fee2e2)', borderRadius: '7px', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '50%', left: `${pct}%`,
          transform: 'translate(-50%, -50%)',
          width: '22px', height: '22px', borderRadius: '50%',
          background: color, border: '3px solid #fff',
          boxShadow: `0 0 0 2px ${color}`,
          transition: 'left 0.5s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
        {['Low (0–30%)', 'Medium (30–60%)', 'High (60–100%)'].map((label) => (
          <span key={label} style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{label}</span>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export function PredictChurn() {
  const [searchParams] = useSearchParams();
  const prefillId = searchParams.get('customer');

  const [form, setForm] = useState<PredictionRequest>({ ...DEFAULTS });
  const [loading, setLoading] = useState(false);
  const [predResult, setPredResult] = useState<PredictionResponse | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [retention, setRetention] = useState<RetentionRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from customer explorer
  useEffect(() => {
    if (prefillId) {
      const customer = MOCK_CUSTOMERS.find((c) => c.customerID === prefillId);
      if (customer) {
        setForm({
          customerID: customer.customerID,
          gender: customer.gender,
          seniorCitizen: customer.seniorCitizen,
          partner: customer.partner,
          dependents: customer.dependents,
          tenure: customer.tenure,
          phoneService: customer.phoneService,
          multipleLines: customer.multipleLines,
          internetService: customer.internetService,
          onlineSecurity: customer.onlineSecurity,
          onlineBackup: customer.onlineBackup,
          deviceProtection: customer.deviceProtection,
          techSupport: customer.techSupport,
          streamingTV: customer.streamingTV,
          streamingMovies: customer.streamingMovies,
          contract: customer.contract,
          paperlessBilling: customer.paperlessBilling,
          paymentMethod: customer.paymentMethod,
          monthlyCharges: customer.monthlyCharges,
          totalCharges: customer.totalCharges,
        });
      }
    }
  }, [prefillId]);

  const set = (key: keyof PredictionRequest) => (value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPredResult(null);
    setExplanation(null);
    setRetention(null);
    try {
      const [pred, exp] = await Promise.all([
        predictChurn(form),
        explainPrediction(form),
      ]);
      setPredResult(pred);
      setExplanation(exp);
      setRetention(generateRetentionRecommendation(
        pred.risk as RiskLevel,
        form.contract,
        form.monthlyCharges,
        form.techSupport,
        form.onlineSecurity,
      ));
      // Scroll to results
      setTimeout(() => document.getElementById('prediction-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      setError('Prediction failed. Using demo mode — check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const PRIORITY_COLOR: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

  return (
    <PageContainer>
      <PageHeader
        title="Predict Customer Churn"
        subtitle="Enter customer details to estimate churn probability using the XGBoost model."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ── Form ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>

          {/* Customer Information */}
          <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
            <SectionHeader title="Customer Information" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <FormRow label="Customer ID">
                <input className="form-input" placeholder="e.g. 7590-VHVEG" value={form.customerID} onChange={(e) => set('customerID')(e.target.value)} />
              </FormRow>
              <FormRow label="Gender">
                <Select value={form.gender} onChange={set('gender')} options={['Male', 'Female']} />
              </FormRow>
              <FormRow label="Senior Citizen">
                <Toggle value={form.seniorCitizen === 1} onChange={(v) => set('seniorCitizen')(v ? 1 : 0)} />
              </FormRow>
              <FormRow label="Has Partner">
                <Toggle value={form.partner === 'Yes'} onChange={(v) => set('partner')(v ? 'Yes' : 'No')} />
              </FormRow>
              <FormRow label="Has Dependents">
                <Toggle value={form.dependents === 'Yes'} onChange={(v) => set('dependents')(v ? 'Yes' : 'No')} />
              </FormRow>
              <FormRow label="Tenure (months)" hint="How long the customer has been with the company">
                <input className="form-input" type="number" min={0} max={72} value={form.tenure} onChange={(e) => set('tenure')(+e.target.value)} />
              </FormRow>
            </div>
          </div>

          {/* Services */}
          <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
            <SectionHeader title="Services" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <FormRow label="Phone Service">
                <Toggle value={form.phoneService === 'Yes'} onChange={(v) => set('phoneService')(v ? 'Yes' : 'No')} />
              </FormRow>
              <FormRow label="Multiple Lines">
                <Select value={form.multipleLines} onChange={set('multipleLines')} options={['No', 'Yes', 'No phone service']} />
              </FormRow>
              <FormRow label="Internet Service">
                <Select value={form.internetService} onChange={set('internetService')} options={['DSL', 'Fiber optic', 'No']} />
              </FormRow>
              <FormRow label="Online Security">
                <Select value={form.onlineSecurity} onChange={set('onlineSecurity')} options={['No', 'Yes', 'No internet service']} />
              </FormRow>
              <FormRow label="Online Backup">
                <Select value={form.onlineBackup} onChange={set('onlineBackup')} options={['No', 'Yes', 'No internet service']} />
              </FormRow>
              <FormRow label="Device Protection">
                <Select value={form.deviceProtection} onChange={set('deviceProtection')} options={['No', 'Yes', 'No internet service']} />
              </FormRow>
              <FormRow label="Tech Support">
                <Select value={form.techSupport} onChange={set('techSupport')} options={['No', 'Yes', 'No internet service']} />
              </FormRow>
              <FormRow label="Streaming TV">
                <Select value={form.streamingTV} onChange={set('streamingTV')} options={['No', 'Yes', 'No internet service']} />
              </FormRow>
              <FormRow label="Streaming Movies">
                <Select value={form.streamingMovies} onChange={set('streamingMovies')} options={['No', 'Yes', 'No internet service']} />
              </FormRow>
            </div>
          </div>

          {/* Account Information */}
          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <SectionHeader title="Account Information" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <FormRow label="Contract">
                <Select value={form.contract} onChange={set('contract')} options={['Month-to-month', 'One year', 'Two year']} />
              </FormRow>
              <FormRow label="Paperless Billing">
                <Toggle value={form.paperlessBilling === 'Yes'} onChange={(v) => set('paperlessBilling')(v ? 'Yes' : 'No')} />
              </FormRow>
              <div style={{ gridColumn: '1 / -1' }}>
                <FormRow label="Payment Method">
                  <Select value={form.paymentMethod} onChange={set('paymentMethod')} options={['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)']} />
                </FormRow>
              </div>
              <FormRow label="Monthly Charges ($)">
                <input className="form-input" type="number" min={0} step={0.01} value={form.monthlyCharges} onChange={(e) => set('monthlyCharges')(+e.target.value)} />
              </FormRow>
              <FormRow label="Total Charges ($)">
                <input className="form-input" type="number" min={0} step={0.01} value={form.totalCharges} onChange={(e) => set('totalCharges')(+e.target.value)} />
              </FormRow>
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {loading ? (
              <><span className="animate-pulse-soft">⚙</span> Analyzing customer profile...</>
            ) : (
              <><Brain size={18} /> Predict Churn Risk</>
            )}
          </button>
          {error && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fee2e2', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
        </form>

        {/* ── Results Panel ─────────────────────────────────── */}
        <div>
          {!predResult && !loading && (
            <div className="card" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
              <Brain size={40} style={{ margin: '0 auto 16px', color: '#c7d2fe' }} />
              <p style={{ fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Ready to predict</p>
              <p style={{ fontSize: '0.875rem' }}>Fill in the customer details on the left and click "Predict Churn Risk".</p>
            </div>
          )}

          {loading && (
            <div className="card animate-pulse-soft" style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🤖</div>
              <p style={{ fontWeight: 600, color: '#4f46e5' }}>Analyzing customer profile...</p>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '4px' }}>Running XGBoost inference</p>
            </div>
          )}

          {predResult && (
            <div id="prediction-result" className="animate-fade-in">

              {/* Prediction Result Card */}
              <div className="card" style={{ padding: '24px', marginBottom: '16px', borderTop: `3px solid ${predResult.risk === 'High' ? '#ef4444' : predResult.risk === 'Medium' ? '#f59e0b' : '#10b981'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>Prediction Result</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {predResult.isDemo && <span className="demo-badge">Demo</span>}
                    <RiskBadge risk={predResult.risk as any} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '10px' }}>
                    <p style={{ fontSize: '2.2rem', fontWeight: 800, color: predResult.risk === 'High' ? '#ef4444' : predResult.risk === 'Medium' ? '#f59e0b' : '#10b981', letterSpacing: '-0.03em' }}>
                      {(predResult.churnProbability * 100).toFixed(1)}%
                    </p>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Churn Probability
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '10px' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                      {predResult.prediction === 1 ? 'Likely to churn' : 'Likely to stay'}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Prediction
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '10px' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                      {predResult.confidence}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Confidence
                    </p>
                  </div>
                </div>

                <ProbabilityGauge probability={predResult.churnProbability} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#eef2ff', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                  <Info size={15} style={{ color: '#4f46e5', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.78rem', color: '#3730a3' }}>
                    <strong>Recommended action:</strong>{' '}
                    {predResult.risk === 'High' ? 'Prioritize retention outreach immediately.' : predResult.risk === 'Medium' ? 'Monitor closely and engage proactively.' : 'Maintain regular customer success cadence.'}
                  </p>
                </div>
              </div>

              {/* SHAP Explanation */}
              {explanation && (
                <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h3 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>Why is this customer at risk?</h3>
                    {explanation.isDemo && <span className="demo-badge">Demo SHAP</span>}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px' }}>{explanation.summary}</p>

                  {explanation.topPositiveFactors.length > 0 && (
                    <>
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#b91c1c', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        ↑ Factors increasing churn risk
                      </p>
                      {explanation.topPositiveFactors.map((f) => (
                        <ShapBar key={f.feature} {...f} />
                      ))}
                    </>
                  )}

                  {explanation.topNegativeFactors.length > 0 && (
                    <>
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#065f46', margin: '16px 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        ↓ Factors reducing churn risk
                      </p>
                      {explanation.topNegativeFactors.map((f) => (
                        <ShapBar key={f.feature} {...f} />
                      ))}
                    </>
                  )}

                  <div style={{ marginTop: '16px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      <Info size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      These explanations are derived from SHAP (SHapley Additive exPlanations) values and should support — not replace — business decisions.
                    </p>
                  </div>
                </div>
              )}

              {/* Retention Recommendation */}
              {retention && (
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>Recommended Retention Strategy</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {retention.isRuleBased && <span className="demo-badge">Rule-based</span>}
                      <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: retention.priority === 'High' ? '#fee2e2' : retention.priority === 'Medium' ? '#fef3c7' : '#d1fae5', color: PRIORITY_COLOR[retention.priority] }}>
                        {retention.priority} Priority
                      </span>
                    </div>
                  </div>
                  {retention.actions.map((action, i) => (
                    <div key={action.id} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#0f172a', marginBottom: '2px' }}>{action.action}</p>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: PRIORITY_COLOR[action.priority] }}>{action.priority} Priority</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fef3c7', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#92400e' }}>
                      These recommendations are <strong>rule-based demo suggestions</strong>. Connect the real FastAPI backend to enable model-driven recommendations.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
