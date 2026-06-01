'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProductList({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [pendingDelete, setPendingDelete] = useState<{ id: number, timeoutId: NodeJS.Timeout, product: any } | null>(null);

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    // If there is already a pending delete, execute it immediately
    if (pendingDelete && pendingDelete.id !== id) {
      clearTimeout(pendingDelete.timeoutId);
      fetch(`/api/products/${pendingDelete.id}`, { method: 'DELETE' }).catch(console.error);
    }

    const prodToDelete = products.find(p => p.id === id);
    if (!prodToDelete) return;

    // Optimistically remove
    setProducts(products.filter(p => p.id !== id));

    const timeoutId = setTimeout(async () => {
      try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
      setPendingDelete(current => current?.id === id ? null : current);
    }, 5000);

    setPendingDelete({ id, timeoutId, product: prodToDelete });
  };

  const handleUndoDelete = () => {
    if (pendingDelete) {
      clearTimeout(pendingDelete.timeoutId);
      // Restore to state
      setProducts([pendingDelete.product, ...products]);
      setPendingDelete(null);
    }
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {products.map((product: any) => (
          <Link 
            href={`/product-catalog/${product.id}`} 
            key={product.id} 
            className="glass-card product-card-link" 
            style={{ 
              padding: '16px', 
              display: 'flex', 
              flexDirection: 'column',
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '8px', zIndex: 2 }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/product-catalog/edit/${product.id}`;
                }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  color: '#eab308',
                  fontSize: '1rem'
                }}
                title="Edit Product"
              >
                <i className="fi fi-rr-edit" style={{ fontSize: '0.9rem' }}></i>
              </button>
              <button
                onClick={(e) => handleDelete(e, product.id)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  color: '#ef4444',
                  fontSize: '1rem'
                }}
                title="Delete Product"
              >
                <i className="fi fi-rr-trash" style={{ fontSize: '0.9rem' }}></i>
              </button>
            </div>

            {product.image ? (
              <img 
                src={product.image} 
                alt={product.itemName} 
                style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '10px', marginBottom: '16px' }} 
              />
            ) : (
              <div style={{ width: '100%', height: '220px', backgroundColor: 'var(--input-border)', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                No Image
              </div>
            )}
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', color: 'var(--primary)', paddingRight: '36px' }}>{product.itemName}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Item Code</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{product.itemCode || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Category</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{product.mainCategory || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Stock</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{product.physicalStock || 0} {product.procureUnit}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ marginBottom: '16px' }}>No Products Yet</h2>
          <p style={{ opacity: 0.7, marginBottom: '24px' }}>Get started by adding your first product to the catalog.</p>
          <Link href="/product-catalog/add" className="btn-primary">
            + Add New Product
          </Link>
        </div>
      )}

      {/* Undo Delete Toast */}
      {pendingDelete && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', zIndex: 9999 }}>
          <span style={{ fontWeight: 500 }}>Product deleted.</span>
          <button 
            onClick={handleUndoDelete}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#38bdf8', fontWeight: 700, cursor: 'pointer', padding: '4px 8px', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}
          >
            Undo
          </button>
        </div>
      )}
    </>
  );
}
