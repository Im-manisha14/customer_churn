import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Brain,
  Users,
  BarChart3,
  TrendingUp,
  DollarSign,
  Info,
  Cpu,
  Activity,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',               icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/predict',        icon: <Brain size={18} />,           label: 'Predict Churn' },
  { to: '/customers',      icon: <Users size={18} />,           label: 'Customers' },
  { to: '/model',          icon: <BarChart3 size={18} />,       label: 'Model Performance' },
  { to: '/drivers',        icon: <TrendingUp size={18} />,      label: 'Churn Drivers' },
  { to: '/business',       icon: <DollarSign size={18} />,      label: 'Business Impact' },
  { to: '/about',          icon: <Info size={18} />,            label: 'About' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRight: '1px solid #1e293b',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={18} color="white" />
          </div>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
            ChurnIQ
          </span>
        </div>
        <p style={{ color: '#475569', fontSize: '0.7rem', marginLeft: '42px', lineHeight: 1.4 }}>
          Customer Churn Intelligence
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        <div style={{ padding: '0 12px', marginBottom: '6px' }}>
          <span style={{ color: '#334155', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Navigation
          </span>
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 16px',
                margin: '1px 8px',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                color: isActive ? '#f1f5f9' : '#64748b',
                background: isActive ? '#1e293b' : 'transparent',
                fontSize: '0.875rem',
                fontWeight: isActive ? 500 : 400,
                position: 'relative',
              }}
            >
              <span style={{ color: isActive ? '#818cf8' : '#475569', flexShrink: 0 }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && (
                <ChevronRight size={14} style={{ color: '#4f46e5' }} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid #1e293b' }}>
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '10px',
            padding: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Cpu size={14} style={{ color: '#818cf8' }} />
            <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ML Model
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, marginBottom: '8px' }}>
            XGBoost Classifier
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'inline-block',
                boxShadow: '0 0 0 2px rgba(16,185,129,0.2)',
              }}
            />
            <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 500 }}>
              Demo Mode Active
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
