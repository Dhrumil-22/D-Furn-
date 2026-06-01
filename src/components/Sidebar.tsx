'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const modules = [
    { name: 'Product Catalogue', path: '/product-catalog', icon: 'fi fi-rr-box-open' },
    { name: 'Material Management', path: '/material-management', icon: 'fi fi-rr-settings' },
    { name: 'Product Tree / BOM', path: '/bom', icon: 'fi fi-rr-sitemap' },
    { name: 'Estimation & Quotation', path: '/quotation', icon: 'fi fi-rr-document' },
    { name: 'Project Management', path: '/projects', icon: 'fi fi-rr-chart-histogram' },
    { name: 'Dealer & Distributor', path: '/dealers', icon: 'fi fi-rr-handshake' },
  ];

  return (
    <aside style={{
      width: '280px',
      backgroundColor: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      color: 'var(--sidebar-text)',
      boxShadow: '2px 0 8px rgba(0,0,0,0.02)'
    }}>
      <div style={{ padding: '0 12px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Hamburger icon placeholder */}
        <i className="fi fi-rr-bars-staggered" style={{ fontSize: '1.2rem', cursor: 'pointer', color: 'var(--sidebar-text)' }}></i>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-orange)', letterSpacing: '-0.5px', margin: 0 }}>
          d'furn<span style={{ color: 'var(--sidebar-text)', fontSize: '1.2rem', fontWeight: 600, marginLeft: '8px' }}>Admin</span>
        </h2>
      </div>
      
      <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, marginBottom: '12px', paddingLeft: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Products
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {modules.map((mod) => {
          const isActive = pathname.startsWith(mod.path);
          return (
            <Link 
              key={mod.path} 
              href={mod.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? '#ffffff' : 'var(--sidebar-text)',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s ease',
                opacity: isActive ? 1 : 0.8,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.opacity = '1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
            >
              <i className={mod.icon} style={{ fontSize: '1.1rem', opacity: isActive ? 1 : 0.7 }}></i>
              {mod.name}
            </Link>
          );
        })}
      </nav>
      
      <div style={{ marginTop: 'auto', padding: '16px', opacity: 0.5, fontSize: '0.8rem', textAlign: 'center' }}>
        v2.1.0
      </div>
    </aside>
  );
}
