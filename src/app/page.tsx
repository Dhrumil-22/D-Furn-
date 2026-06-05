import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      {/* Hero Banner */}
      <div style={{ 
        position: 'relative', 
        padding: '60px 40px', 
        borderRadius: '24px', 
        background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
        color: 'white',
        overflow: 'hidden',
        marginBottom: '40px',
        boxShadow: '0 20px 40px rgba(79, 70, 229, 0.2)'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '60%', height: '200%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', transform: 'rotate(15deg)' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Welcome to <span style={{ color: '#fb923c' }}>D'furn</span> ERP
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', lineHeight: 1.6 }}>
            A powerful, intelligent enterprise resource planning system designed to streamline your product catalog, material inventory, and daily operations.
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-color)' }}>Quick Access Modules</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          <Link href="/material-management" style={{ textDecoration: 'none' }}>
            <div className="glass-card module-card" style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#10b981' }}>
                <i className="fi fi-rr-boxes" style={{ fontSize: '24px' }}></i>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-color)' }}>Material Management</h3>
              <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: 1.5, flexGrow: 1, color: 'var(--text-color)' }}>
                Track POs, internal requests, physical stock verification, and GRN inventory movement.
              </p>
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
                Access Module <i className="fi fi-rr-arrow-right" style={{ marginTop: '2px' }}></i>
              </div>
            </div>
          </Link>

          <Link href="/authorization-access" style={{ textDecoration: 'none' }}>
            <div className="glass-card module-card" style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#f59e0b' }}>
                <i className="fi fi-rr-users-alt" style={{ fontSize: '24px' }}></i>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-color)' }}>Authorization & Access</h3>
              <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: 1.5, flexGrow: 1, color: 'var(--text-color)' }}>
                Manage system users, define roles, and control permission levels across the organization.
              </p>
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem' }}>
                Access Module <i className="fi fi-rr-arrow-right" style={{ marginTop: '2px' }}></i>
              </div>
            </div>
          </Link>

        </div>
      </div>
      
      {/* Upcoming features */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-color)', opacity: 0.8 }}>Coming Soon</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {['Product Catalogue', 'Product Tree / BOM', 'Estimation & Quotation', 'Project Management', 'Dealer & Distributor'].map((feature, i) => (
            <div key={i} style={{ padding: '12px 20px', backgroundColor: 'var(--card-bg)', border: '1px dashed var(--input-border)', borderRadius: '100px', fontSize: '0.9rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fi fi-rr-lock" style={{ fontSize: '14px' }}></i>
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
