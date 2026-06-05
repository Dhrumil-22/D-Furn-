'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (pathname === '/login') {
    return null;
  }

  let modules = [
    { name: 'Product Catalogue', path: '/product-catalog', icon: 'fi fi-rr-box-open' },
    { name: 'Material Management', path: '/material-management', icon: 'fi fi-rr-settings' },
    { name: 'Product Tree / BOM', path: '/bom', icon: 'fi fi-rr-sitemap' },
    { name: 'Estimation & Quotation', path: '/quotation', icon: 'fi fi-rr-document' },
    { name: 'Project Management', path: '/projects', icon: 'fi fi-rr-chart-histogram' },
    { name: 'Dealer & Distributor', path: '/dealers', icon: 'fi fi-rr-handshake' },
    { name: 'Authorization Access', path: '/authorization-access', icon: 'fi fi-rr-lock' },
  ];

  if (userRole && userRole.toUpperCase() === 'VERIFIER') {
    modules = [
      { name: 'Physical Verification', path: '/material-management/physical-verification', icon: 'fi fi-rr-clipboard-list-check' },
      { name: 'Past Records', path: '/material-management/physical-verification-history', icon: 'fi fi-rr-time-past' }
    ];
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <div className="mobile-header">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
          d'furn<span style={{ color: 'var(--sidebar-text)', fontSize: '1.2rem', fontWeight: 600, marginLeft: '8px' }}>Admin</span>
        </h2>
        <i className="fi fi-rr-bars-staggered" style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setIsOpen(true)}></i>
      </div>
      
      <div className={`mobile-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}></div>

      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isDesktopCollapsed ? 'collapsed' : ''}`}>
        <div style={{ padding: '0 12px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: isDesktopCollapsed ? 'center' : 'flex-start' }}>
          
          {/* Mobile close button */}
          <i className="fi fi-rr-cross desktop-hide" style={{ fontSize: '1.2rem', cursor: 'pointer', color: 'var(--sidebar-text)' }} onClick={() => setIsOpen(false)}></i>
          
          <i className="fi fi-rr-bars-staggered mobile-hide" style={{ fontSize: '1.5rem', cursor: 'pointer', color: 'var(--brand-orange)' }} onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}></i>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-orange)', letterSpacing: '-0.5px', margin: 0, whiteSpace: 'nowrap', opacity: isDesktopCollapsed ? 0 : 1, transition: 'opacity 0.2s ease', overflow: 'hidden' }}>
            d'furn<span style={{ color: 'var(--sidebar-text)', fontSize: '1.2rem', fontWeight: 600, marginLeft: '8px' }}>Admin</span>
          </h2>
        </div>
      
      <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: isDesktopCollapsed ? 0 : 0.6, marginBottom: '12px', paddingLeft: '12px', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', transition: 'opacity 0.2s ease', overflow: 'hidden' }}>
        Modules
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {modules.map((mod) => {
          // Exact match or starts with + slash (to prevent physical-verification matching physical-verification-history)
          const isActive = pathname === mod.path || pathname.startsWith(mod.path + '/');
          
          return (
            <Link 
              key={mod.path} 
              href={mod.path}
              title={isDesktopCollapsed ? mod.name : undefined}
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
                whiteSpace: 'nowrap',
                overflow: 'hidden'
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
              onClick={() => setIsOpen(false)}
            >
              <i className={mod.icon} style={{ fontSize: '1.1rem', opacity: isActive ? 1 : 0.7, minWidth: '1.1rem' }}></i>
              <span style={{ opacity: isDesktopCollapsed ? 0 : 1, transition: 'opacity 0.2s ease' }}>{mod.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div style={{ marginTop: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {mounted && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={isDesktopCollapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              width: '100%',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'var(--sidebar-text)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              transition: 'all 0.2s ease'
            }}
          >
            <i className={theme === 'dark' ? "fi fi-rr-sun" : "fi fi-rr-moon"} style={{ fontSize: '1.2rem', margin: 0, minWidth: '1.2rem' }}></i>
            <span style={{ opacity: isDesktopCollapsed ? 0 : 1, transition: 'opacity 0.2s ease' }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        )}

        <button 
          onClick={handleLogout}
          title={isDesktopCollapsed ? "Sign Out" : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            width: '100%',
            borderRadius: '8px',
            backgroundColor: '#fee2e2',
            color: '#ef4444',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          <i className="fi fi-rr-sign-out-alt" style={{ fontSize: '1.2rem', margin: 0, minWidth: '1.2rem' }}></i>
          <span style={{ opacity: isDesktopCollapsed ? 0 : 1, transition: 'opacity 0.2s ease' }}>Sign Out</span>
        </button>
      </div>
      </aside>
    </>
  );
}
