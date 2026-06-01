import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>Welcome to DFurn ERP</h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '32px', maxWidth: '600px' }}>
        A complete ERP system for managing product catalogs, material inventory, and production.
      </p>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/product-catalog" className="glass-card" style={{ display: 'block', width: '300px', textDecoration: 'none', transition: 'transform 0.2s ease' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '12px' }}>Product Catalog &rarr;</h2>
          <p style={{ opacity: 0.8 }}>Manage your product inventory, variants, and visual media.</p>
        </Link>
        
        <div className="glass-card" style={{ width: '300px', opacity: 0.5 }}>
          <h2 style={{ marginBottom: '12px' }}>Material Management</h2>
          <p style={{ opacity: 0.8 }}>Coming soon in Phase 1.</p>
        </div>
      </div>
    </div>
  );
}
