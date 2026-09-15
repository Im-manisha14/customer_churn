import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, ChevronUp, ChevronDown } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/layout/PageHeader';
import { RiskBadge } from '../components/ui/KPICard';
import { TableSkeleton, EmptyState, ErrorState } from '../components/ui/States';
import { getCustomers } from '../services/api';
import type { Customer, RiskLevel } from '../types';

type SortField = 'tenure' | 'monthlyCharges' | 'totalCharges' | 'churnProbability';
type SortDir = 'asc' | 'desc';

export function CustomerExplorer() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'All'>('All');
  const [contractFilter, setContractFilter] = useState<string>('All');
  const [internetFilter, setInternetFilter] = useState<string>('All');
  const [churnFilter, setChurnFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('churnProbability');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Customer detail modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch {
      setError('Failed to load customer data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = [...customers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.customerID.toLowerCase().includes(q));
    }
    if (riskFilter !== 'All') result = result.filter((c) => c.riskLevel === riskFilter);
    if (contractFilter !== 'All') result = result.filter((c) => c.contract === contractFilter);
    if (internetFilter !== 'All') result = result.filter((c) => c.internetService === internetFilter);
    if (churnFilter !== 'All') result = result.filter((c) => c.churn === churnFilter);
    result.sort((a, b) => {
      const av = (a[sortField] ?? 0) as number;
      const bv = (b[sortField] ?? 0) as number;
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return result;
  }, [customers, search, riskFilter, contractFilter, internetFilter, churnFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={12} style={{ color: '#cbd5e1' }} />;
    return sortDir === 'asc' ? <ChevronUp size={12} style={{ color: '#4f46e5' }} /> : <ChevronDown size={12} style={{ color: '#4f46e5' }} />;
  };

  const clearFilters = () => {
    setSearch(''); setRiskFilter('All'); setContractFilter('All'); setInternetFilter('All'); setChurnFilter('All');
  };

  const hasFilters = search || riskFilter !== 'All' || contractFilter !== 'All' || internetFilter !== 'All' || churnFilter !== 'All';

  return (
    <PageContainer>
      <PageHeader title="Customer Explorer" subtitle="Browse, filter, and analyze individual customer churn risk profiles." />

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              className="form-input"
              style={{ paddingLeft: '34px' }}
              placeholder="Search by Customer ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Risk filter */}
          <select className="form-select" style={{ width: '140px' }} value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as any)}>
            <option value="All">All Risk</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          {/* Contract filter */}
          <select className="form-select" style={{ width: '160px' }} value={contractFilter} onChange={(e) => setContractFilter(e.target.value)}>
            <option value="All">All Contracts</option>
            <option value="Month-to-month">Month-to-month</option>
            <option value="One year">One year</option>
            <option value="Two year">Two year</option>
          </select>

          {/* Internet filter */}
          <select className="form-select" style={{ width: '160px' }} value={internetFilter} onChange={(e) => setInternetFilter(e.target.value)}>
            <option value="All">All Internet</option>
            <option value="Fiber optic">Fiber optic</option>
            <option value="DSL">DSL</option>
            <option value="No">No Internet</option>
          </select>

          {/* Churn filter */}
          <select className="form-select" style={{ width: '140px' }} value={churnFilter} onChange={(e) => setChurnFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Yes">Churned</option>
            <option value="No">Retained</option>
          </select>

          {hasFilters && (
            <button className="btn-secondary" onClick={clearFilters} style={{ padding: '8px 12px' }}>
              <X size={14} /> Clear
            </button>
          )}

          <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
            {filtered.length} of {customers.length} customers
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? <TableSkeleton rows={8} /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th
                    onClick={() => toggleSort('tenure')}
                    style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    Tenure <SortIcon field="tenure" />
                  </th>
                  <th>Contract</th>
                  <th
                    onClick={() => toggleSort('monthlyCharges')}
                    style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    Monthly $ <SortIcon field="monthlyCharges" />
                  </th>
                  <th
                    onClick={() => toggleSort('totalCharges')}
                    style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    Total $ <SortIcon field="totalCharges" />
                  </th>
                  <th
                    onClick={() => toggleSort('churnProbability')}
                    style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    Churn Prob <SortIcon field="churnProbability" />
                  </th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <EmptyState title="No customers match your filters" description="Try adjusting the search or filter criteria." icon="🔍" />
                    </td>
                  </tr>
                ) : filtered.map((c) => (
                  <tr key={c.customerID} style={{ cursor: 'pointer' }} onClick={() => setSelectedCustomer(c)}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>
                      {c.customerID}
                    </td>
                    <td>{c.tenure} mo</td>
                    <td>
                      <span style={{
                        padding: '2px 7px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500,
                        background: c.contract === 'Month-to-month' ? '#fee2e2' : c.contract === 'One year' ? '#fef3c7' : '#d1fae5',
                        color: c.contract === 'Month-to-month' ? '#b91c1c' : c.contract === 'One year' ? '#92400e' : '#065f46',
                      }}>
                        {c.contract}
                      </span>
                    </td>
                    <td>${c.monthlyCharges.toFixed(2)}</td>
                    <td>${c.totalCharges.toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '48px', height: '5px', background: '#f1f5f9', borderRadius: '3px' }}>
                          <div style={{ height: '100%', width: `${(c.churnProbability ?? 0) * 100}%`, background: c.riskLevel === 'High' ? '#ef4444' : c.riskLevel === 'Medium' ? '#f59e0b' : '#10b981', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{((c.churnProbability ?? 0) * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td><RiskBadge risk={c.riskLevel ?? 'Low'} size="sm" /></td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: c.churn === 'Yes' ? '#fee2e2' : '#d1fae5', color: c.churn === 'Yes' ? '#b91c1c' : '#065f46' }}>
                        {c.churn === 'Yes' ? 'Churned' : 'Retained'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/predict?customer=${c.customerID}`); }}
                      >
                        Predict
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="card animate-fade-in"
            style={{ width: '100%', maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto', padding: '28px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>{selectedCustomer.customerID}</h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Customer Profile</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <RiskBadge risk={selectedCustomer.riskLevel ?? 'Low'} />
                <button className="btn-secondary" style={{ padding: '6px 10px' }} onClick={() => setSelectedCustomer(null)}><X size={16} /></button>
              </div>
            </div>

            {/* Churn Probability */}
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, color: selectedCustomer.riskLevel === 'High' ? '#ef4444' : selectedCustomer.riskLevel === 'Medium' ? '#f59e0b' : '#10b981', letterSpacing: '-0.03em' }}>
                {((selectedCustomer.churnProbability ?? 0) * 100).toFixed(1)}%
              </p>
              <p style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>Demo Churn Probability</p>
            </div>

            {/* Detail Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Gender', value: selectedCustomer.gender },
                { label: 'Senior Citizen', value: selectedCustomer.seniorCitizen ? 'Yes' : 'No' },
                { label: 'Partner', value: selectedCustomer.partner },
                { label: 'Dependents', value: selectedCustomer.dependents },
                { label: 'Tenure', value: `${selectedCustomer.tenure} months` },
                { label: 'Contract', value: selectedCustomer.contract },
                { label: 'Internet', value: selectedCustomer.internetService },
                { label: 'Monthly $', value: `$${selectedCustomer.monthlyCharges.toFixed(2)}` },
                { label: 'Total $', value: `$${selectedCustomer.totalCharges.toFixed(2)}` },
                { label: 'Payment', value: selectedCustomer.paymentMethod },
                { label: 'Tech Support', value: selectedCustomer.techSupport },
                { label: 'Online Security', value: selectedCustomer.onlineSecurity },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{label}</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { navigate(`/predict?customer=${selectedCustomer.customerID}`); setSelectedCustomer(null); }}>
                Run Full Prediction
              </button>
              <button className="btn-secondary" onClick={() => setSelectedCustomer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
