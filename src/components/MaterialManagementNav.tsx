'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MaterialManagementNav() {
  const pathname = usePathname();
  
  const tabs = [
    { name: 'Purchase Orders', path: '/material-management/purchase-order' },
    { name: 'Physical Verification', path: '/material-management/physical-verification' },
    { name: 'System Logs', path: '/material-management/logs' },
    { name: 'Inward / Issue', path: '/material-management/inward-issue' },
    { name: 'Job Work In/Out', path: '/material-management/job-work' },
    { name: 'Vendor Master', path: '/material-management/vendor-master' },
    { name: 'MSME Compliance', path: '/material-management/msme-compliance' },
    { name: 'Multi-Vendor Pricing', path: '/material-management/multi-vendor-pricing' },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      borderBottom: '2px solid var(--sidebar-border)',
      marginBottom: '32px',
      overflowX: 'auto',
      paddingBottom: '2px'
    }}>
      {tabs.map((tab) => {
        const isExactMatch = pathname.startsWith(tab.path);
          
        return (
          <Link
            key={tab.path}
            href={tab.path === '/material-management/purchase-order' ? '/material-management/purchase-order/history' : tab.path}
            style={{
              padding: '12px 20px',
              fontSize: '0.95rem',
              fontWeight: isExactMatch ? 600 : 500,
              color: isExactMatch ? 'var(--primary)' : 'var(--foreground)',
              textDecoration: 'none',
              borderBottom: isExactMatch ? '3px solid var(--primary)' : '3px solid transparent',
              marginBottom: '-2px',
              transition: 'all 0.2s ease',
              opacity: isExactMatch ? 1 : 0.6,
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (!isExactMatch) {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
                e.currentTarget.style.borderTopLeftRadius = '6px';
                e.currentTarget.style.borderTopRightRadius = '6px';
              }
            }}
            onMouseLeave={(e) => {
              if (!isExactMatch) {
                e.currentTarget.style.opacity = '0.6';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
