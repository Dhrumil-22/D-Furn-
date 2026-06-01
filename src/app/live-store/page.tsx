import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function LiveStorePage() {
  const categories = await prisma.category.findMany({
    where: { isAvailable: true, type: 'SUB' },
    orderBy: { id: 'asc' }
  });

  const products = await prisma.product.findMany({
    where: { websiteSync: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '0' }}>
      {/* Fake Browser Header */}
      <div style={{ padding: '16px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#f97316', letterSpacing: '-0.5px' }}>
          d'furn <span style={{ color: '#1e293b', fontSize: '1.2rem', fontWeight: 600 }}>store</span>
        </h1>
        <div style={{ flexGrow: 1, display: 'flex', gap: '16px' }}>
          {categories.slice(0, 5).map((cat: any) => (
            <span key={cat.id} style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>{cat.name}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        
        {/* Categories Section */}
        {categories.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '24px', color: '#0f172a' }}>Shop by Category</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {categories.map((cat: any) => (
                <div key={cat.id} style={{ position: 'relative', height: '140px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h3 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{cat.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '24px', color: '#0f172a' }}>Featured Products</h2>
          {products.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              <h3>No products currently synced.</h3>
              <p>Go to your ERP Website Sync dashboard to make products live!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
              {products.map((p: any) => (
                <div key={p.id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  {p.image ? (
                    <img src={p.image} alt={p.itemName} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '200px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No Image Available</div>
                  )}
                  <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{p.mainCategory}</div>
                    <h4 style={{ fontSize: '1.1rem', margin: '0 0 12px 0', color: '#0f172a' }}>{p.itemName}</h4>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem' }}>₹{p.issuedUnitCost?.toFixed(2) || 'Contact for Price'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
