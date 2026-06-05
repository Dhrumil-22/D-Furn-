'use client';

import { useState } from 'react';

export default function WebsiteSyncDashboard({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedMainCat, setSelectedMainCat] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');

  const toggleSync = async (id: number, currentSync: boolean) => {
    // Optimistic update for snappy UI
    setProducts(products.map(p => p.id === id ? { ...p, websiteSync: !currentSync } : p));
    
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteSync: !currentSync })
      });
    } catch (e) {
      // revert on error
      console.error(e);
      setProducts(products.map(p => p.id === id ? { ...p, websiteSync: currentSync } : p));
    }
  };

  const mainCategories = Array.from(new Set(products.map(p => p.mainCategory).filter(Boolean)));
  const subCategories = Array.from(new Set(
    products
      .filter(p => !selectedMainCat || p.mainCategory === selectedMainCat)
      .map(p => p.subCategory)
      .filter(Boolean)
  ));

  const filteredAdminProducts = products.filter(p => {
    if (selectedMainCat && p.mainCategory !== selectedMainCat) return false;
    if (selectedSubCat && p.subCategory !== selectedSubCat) return false;
    return true;
  });

  const syncedProducts = filteredAdminProducts.filter(p => p.websiteSync);

  return (
    <div className="responsive-grid-2" style={{ minHeight: '600px' }}>
      
      {/* Admin Panel (Left) */}
      <div className="glass-card">
        <h2 style={{ color: 'var(--primary)', marginBottom: '8px' }}>ERP Sync Control</h2>
        <p style={{ opacity: 0.7, marginBottom: '20px', fontSize: '0.95rem' }}>Use the toggles to push products live to the website instantly.</p>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <select 
            value={selectedMainCat} 
            onChange={(e) => { setSelectedMainCat(e.target.value); setSelectedSubCat(''); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', flex: 1 }}
          >
            <option value="">All Main Categories</option>
            {mainCategories.map(cat => (
              <option key={cat as string} value={cat as string}>{cat as string}</option>
            ))}
          </select>
          <select 
            value={selectedSubCat} 
            onChange={(e) => setSelectedSubCat(e.target.value)}
            disabled={!selectedMainCat || subCategories.length === 0}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', flex: 1, opacity: (!selectedMainCat || subCategories.length === 0) ? 0.5 : 1 }}
          >
            <option value="">All Sub Categories</option>
            {subCategories.map(cat => (
              <option key={cat as string} value={cat as string}>{cat as string}</option>
            ))}
          </select>
        </div>
        
        {filteredAdminProducts.length === 0 && <p style={{ opacity: 0.5 }}>No products found for this filter.</p>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAdminProducts.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '12px', transition: 'all 0.2s', boxShadow: p.websiteSync ? '0 4px 12px rgba(34, 197, 94, 0.1)' : 'none' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem' }}>{p.itemName}</h4>
                <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{p.mainCategory || 'Uncategorized'} | Code: {p.itemCode || '-'}</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.5px', color: p.websiteSync ? '#22c55e' : 'var(--foreground)', opacity: p.websiteSync ? 1 : 0.5 }}>
                  {p.websiteSync ? 'LIVE' : 'HIDDEN'}
                </span>
                <div style={{ position: 'relative', width: '44px', height: '24px', backgroundColor: p.websiteSync ? '#22c55e' : '#cbd5e1', borderRadius: '12px', transition: 'background-color 0.2s' }}>
                  <div style={{ position: 'absolute', top: '2px', left: p.websiteSync ? '22px' : '2px', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transition: 'left 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
                <input 
                  type="checkbox" 
                  checked={p.websiteSync || false} 
                  onChange={() => toggleSync(p.id, p.websiteSync || false)}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Website View (Right) */}
      <div className="glass-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
          <div style={{ marginLeft: '16px', flexGrow: 1, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fi fi-rr-lock" style={{ fontSize: '0.8rem', color: '#22c55e', marginRight: '4px' }}></i> https://www.dfurn.com/shop
          </div>
        </div>
        
        <div style={{ padding: '32px', flexGrow: 1, backgroundColor: '#ffffff', overflowY: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px', letterSpacing: '-1px' }}>D'FURN LIVE STORE</h1>
            <p style={{ color: '#64748b' }}>Discover our latest collection.</p>
          </div>
          
          {syncedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed #e2e8f0', borderRadius: '12px', color: '#94a3b8' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}><i className="fi fi-rr-shopping-cart" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i></div>
              <h3>Store is Empty</h3>
              <p>Turn on the sync toggle in the ERP to push products here!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {syncedProducts.map(p => (
                <div key={p.id} style={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden', transition: 'box-shadow 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  {p.image ? (
                    <img src={p.image} alt={p.itemName} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '180px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>No Image</div>
                  )}
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{p.mainCategory}</div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 12px 0', color: '#0f172a' }}>{p.itemName}</h4>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{p.issuedUnitCost?.toFixed(2) || 'Contact for Price'}</div>
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
