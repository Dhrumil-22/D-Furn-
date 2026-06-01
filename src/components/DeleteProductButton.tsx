'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteProductButton({ id, itemName }: { id: number, itemName: string }) {
  const [pendingDelete, setPendingDelete] = useState<{ timeoutId: NodeJS.Timeout } | null>(null);
  const router = useRouter();

  const handleDelete = () => {
    if (pendingDelete) {
      clearTimeout(pendingDelete.timeoutId);
      fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(console.error);
      router.push('/product-catalog');
      router.refresh();
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        router.push('/product-catalog');
        router.refresh();
      } catch (error) {
        console.error(error);
        alert('An error occurred while deleting.');
      }
    }, 5000);

    setPendingDelete({ timeoutId });
  };

  const handleUndo = () => {
    if (pendingDelete) {
      clearTimeout(pendingDelete.timeoutId);
      setPendingDelete(null);
    }
  };

  return (
    <>
      <button 
        onClick={handleDelete} 
        style={{
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ef4444';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Delete Product
      </button>

      {/* Full-screen overlay to simulate it being deleted, plus the toast */}
      {pendingDelete && (
        <>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 9998, backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', zIndex: 9999 }}>
            <span style={{ fontWeight: 500 }}>Product deleted. Returning to catalog...</span>
            <button 
              onClick={handleUndo}
              style={{ backgroundColor: 'transparent', border: 'none', color: '#38bdf8', fontWeight: 700, cursor: 'pointer', padding: '4px 8px', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}
            >
              Undo
            </button>
          </div>
        </>
      )}
    </>
  );
}
