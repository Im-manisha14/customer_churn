import { GitBranch, ExternalLink } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/layout/PageHeader';

// ── Pipeline Step ─────────────────────────────────────────────

function PipelineStep({ label, index, total }: { label: string; index: number; total: number }) {
  const isLast = index === total - 1;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
      <div style={{
        padding: '8px 16px',
        background: index === 0 ? '#0f172a' : '#eef2ff',
        color: index === 0 ? '#fff' : '#4f46e5',
        borderRadius: '6px',
        fontSize: '0.8rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      {!isLast && (
        <div style={{ padding: '0 6px', color: '#94a3b8', fontSize: '1rem' }}>→</div>
      )}
    </div>
  );
}

// ── Tech Badge ────────────────────────────────────────────────

function TechBadge({ name, color }: { name: string; color: string }) {
  return (
    <span style={{
      padding: '5px 12px',
      border: `1px solid ${color}20`,
      background: `${color}10`,
      color: color,
      borderRadius: '6px',
      fontSize: '0.8rem',
      fontWeight: 600,
    }}>
      {name}
    </span>
  );
}

// ── Differentiator ────────────────────────────────────────────

function Differentiator({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div style={{ display: 'flex', gap: '14px', padding: '14px', background: '#f8fafc', borderRadius: '10px' }}>
      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px', fontSize: '0.9rem' }}>{title}</p>
        <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>{description}</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

const PIPELINE = ['Raw Data', 'EDA', 'Preprocessing', 'Feature Engineering', 'Model Training', 'Evaluation', 'SHAP Explainability', 'FastAPI', 'Dashboard'];

const TECH_STACK: { name: string; color: string; category: string }[] = [
  { name: 'Python', color: '#3776AB', category: 'ML Backend' },
  { name: 'Pandas', color: '#150458', category: 'ML Backend' },
  { name: 'NumPy', color: '#013243', category: 'ML Backend' },
  { name: 'Scikit-learn', color: '#F7931E', category: 'ML Backend' },
  { name: 'XGBoost', color: '#1A56DB', category: 'ML Backend' },
  { name: 'SHAP', color: '#FF0066', category: 'ML Backend' },
  { name: 'FastAPI', color: '#009688', category: 'API' },
  { name: 'Pydantic', color: '#E92063', category: 'API' },
  { name: 'React', color: '#61DAFB', category: 'Frontend' },
  { name: 'TypeScript', color: '#3178C6', category: 'Frontend' },
  { name: 'Tailwind CSS', color: '#06B6D4', category: 'Frontend' },
  { name: 'Recharts', color: '#22C55E', category: 'Frontend' },
  { name: 'Docker', color: '#2496ED', category: 'Infrastructure' },
];

const DIFFERENTIATORS = [
  { icon: '🎯', title: 'Business-focused evaluation', description: 'Uses cost-sensitive threshold selection rather than maximizing accuracy alone. Optimizes the decision boundary for actual business ROI.' },
  { icon: '🧠', title: 'Explainable predictions', description: 'Every prediction is accompanied by SHAP-based factor analysis, showing exactly which features drove the risk score.' },
  { icon: '🔗', title: 'End-to-end deployment', description: 'Full-stack: from raw CSV through preprocessing pipeline, trained model, FastAPI REST API, to interactive React dashboard.' },
  { icon: '🔄', title: 'Modular architecture', description: 'Clean separation between data, model, API, and UI layers. Mock service layer enables instant demo without a running backend.' },
  { icon: '📊', title: 'Interactive risk analysis', description: 'Real-time threshold simulation, customer-level predictions, and retention campaign ROI calculator built into the dashboard.' },
];

export function About() {
  return (
    <PageContainer>
      <PageHeader title="About This Project" />

      <div style={{ maxWidth: '900px' }}>

        {/* Hero */}
        <div className="card" style={{ padding: '28px', marginBottom: '20px', background: '#0f172a', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                Customer Churn Prediction
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '540px' }}>
                An end-to-end ML platform that identifies at-risk telecom customers, explains predictions using SHAP, and quantifies the business value of targeted retention campaigns.
              </p>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', background: '#1e293b', color: '#f1f5f9',
                borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
                border: '1px solid #334155',
              }}
            >
              <GitBranch size={16} /> View on GitHub
            </a>
          </div>
        </div>

        {/* Problem Statement */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '10px' }}>Problem Statement</h2>
          <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.8 }}>
            Customer churn directly impacts recurring revenue. For telecom companies like the one in this dataset, losing a customer means losing the entire future revenue stream from that account. The goal of this project is to <strong>identify customers at high risk of churn early enough</strong> for retention teams to intervene — before the customer leaves.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.8, marginTop: '10px' }}>
            This project demonstrates that effective churn prevention requires not just a high-accuracy model, but a business-aware system: one that explains <em>why</em> a customer is at risk, quantifies the financial impact of different intervention strategies, and integrates smoothly with existing workflows.
          </p>
        </div>

        {/* ML Pipeline */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '16px' }}>ML Pipeline</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0', alignItems: 'center' }}>
            {PIPELINE.map((step, i) => (
              <PipelineStep key={step} label={step} index={i} total={PIPELINE.length} />
            ))}
          </div>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['Data', 'Telco Customer Churn dataset (Kaggle / IBM Sample Data), 7,043 customers, 20 features'],
              ['Preprocessing', 'Categorical encoding, numeric scaling, missing value handling, train/test split'],
              ['Feature Engineering', 'Tenure grouping, charge-per-month ratio, service bundle count'],
              ['Model', 'XGBoost with class-weight balancing; hyperparameter tuning via GridSearchCV'],
              ['Evaluation', 'Optimized for Recall with F1 and ROC-AUC as secondary metrics'],
              ['Explainability', 'Global feature importance + per-prediction SHAP waterfall values'],
              ['Serving', 'FastAPI REST API with Pydantic validation; SHAP explanations on-demand'],
            ].map(([label, desc]) => (
              <div key={label} style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4f46e5', minWidth: '120px', flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What makes it different */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '16px' }}>What makes this project different?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {DIFFERENTIATORS.map((d) => (
              <Differentiator key={d.title} {...d} />
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '16px' }}>Technology Stack</h2>
          {(['ML Backend', 'API', 'Frontend', 'Infrastructure'] as const).map((cat) => {
            const items = TECH_STACK.filter((t) => t.category === cat);
            return (
              <div key={cat} style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{cat}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {items.map((t) => <TechBadge key={t.name} name={t.name} color={t.color} />)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dataset */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '10px' }}>Dataset</h2>
          <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.8, marginBottom: '12px' }}>
            This project uses the <strong>Telco Customer Churn</strong> dataset, originally provided by IBM and widely available on Kaggle. It contains 7,043 customers with 20 features covering demographics, service subscriptions, account details, and churn labels.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { href: 'https://www.kaggle.com/datasets/blastchar/telco-customer-churn', label: 'Kaggle Dataset' },
              { href: 'https://www.ibm.com/communities/analytics/watson-analytics-blog/guide-to-sample-datasets/', label: 'IBM Sample Data' },
            ].map(({ href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500, color: '#4f46e5', textDecoration: 'none' }}>
                {label} <ExternalLink size={13} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
