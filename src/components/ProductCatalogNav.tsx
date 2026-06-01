'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProductCatalogNav() {
  const pathname = usePathname();
  
  const tabs = [
    { name: 'Website Sync', path: '/product-catalog/website-sync' },
    { name: 'Category Hierarchy', path: '/product-catalog/category-hierarchy' },
    { name: 'SKU Management', path: '/product-catalog' },
    { name: 'Variants', path: '/product-catalog/variants' },
    { name: 'Lifecycle Status', path: '/product-catalog/lifecycle' },
    { name: 'Rich Media', path: '/product-catalog/rich-media' },
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
        // Special case: /product-catalog matches SKU Management exactly
        // Other tabs match their exact path
        const isExactMatch = tab.path === '/product-catalog' 
          ? pathname === '/product-catalog' || pathname === '/product-catalog/add'
          : pathname.startsWith(tab.path);
          
        return (
          <Link
            key={tab.path}
            href={tab.path}
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
