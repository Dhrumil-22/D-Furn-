'use client';

import Link from 'next/link';

export default function MaterialManagementDashboard() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Material Management</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        
        <Link href="/material-management/purchase-order" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minHeight: '200px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '3rem' }}>📄</div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: 0 }}>Purchase Order Generator</h3>
            <p style={{ textAlign: 'center', opacity: 0.7, margin: 0, fontSize: '0.9rem' }}>
              Create, preview, and download custom PDF purchase orders for your vendors.
            </p>
          </div>
        </Link>

      </div>
    </div>
  );
}
