'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Simple check to get role if we stored it in localstorage or check API.
    // For now we'll just show the link and let middleware protect it.
  }, []);
  
  const modules = [
    { name: 'Product Catalogue', path: '/product-catalog', icon: 'fi fi-rr-box-open' },
    { name: 'Material Management', path: '/material-management', icon: 'fi fi-rr-settings' },
    { name: 'Product Tree / BOM', path: '/bom', icon: 'fi fi-rr-sitemap' },
    { name: 'Estimation & Quotation', path: '/quotation', icon: 'fi fi-rr-document' },
    { name: 'Project Management', path: '/projects', icon: 'fi fi-rr-chart-histogram' },
    { name: 'Dealer & Distributor', path: '/dealers', icon: 'fi fi-rr-handshake' },
    { name: 'Authorization Access', path: '/authorization-access', icon: 'fi fi-rr-lock' },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

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
        <i className="fi fi-rr-bars-staggered" style={{ fontSize: '1.2rem', cursor: 'pointer', color: 'var(--sidebar-text)' }}></i>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-orange)', letterSpacing: '-0.5px', margin: 0 }}>
          d'furn<span style={{ color: 'var(--sidebar-text)', fontSize: '1.2rem', fontWeight: 600, marginLeft: '8px' }}>Admin</span>
        </h2>
      </div>
      
      <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, marginBottom: '12px', paddingLeft: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Modules
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
      
      <div style={{ marginTop: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {mounted && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'var(--sidebar-text)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <i className={theme === 'dark' ? "fi fi-rr-sun" : "fi fi-rr-moon"} style={{ fontSize: '1.1rem' }}></i>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        )}

        <button 
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: '#fee2e2',
            color: '#ef4444',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          <i className="fi fi-rr-sign-out-alt" style={{ fontSize: '1.1rem' }}></i>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
