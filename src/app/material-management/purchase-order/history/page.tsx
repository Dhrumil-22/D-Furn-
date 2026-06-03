'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CustomDropdown from '@/components/CustomDropdown';

export default function PurchaseOrderHistory() {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/purchase-orders');
      const data = await res.json();

      if (Array.isArray(data)) {
        setPurchaseOrders(data);
      } else {
        console.error('API Error Payload:', JSON.stringify(data));
        setPurchaseOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch POs', error);
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this Purchase Order?')) {
      try {
        await fetch(`/api/purchase-orders/${id}`, { method: 'DELETE' });
        setPurchaseOrders(purchaseOrders.filter(po => po.id !== id));
      } catch (error) {
        console.error('Failed to delete PO', error);
        alert('Failed to delete PO');
      }
    }
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const searchLower = searchTerm.toLowerCase();
    const poNumber = (po.poNumber || '').toLowerCase();
    const vendorName = (po.vendorName || '').toLowerCase();
    
    const matchesSearch = searchTerm === '' || poNumber.includes(searchLower) || vendorName.includes(searchLower);
    
    let matchesDate = true;
    if (filterYear || filterMonth) {
      const logDate = new Date(po.purchaseDate || po.createdAt);
      if (filterYear && logDate.getFullYear().toString() !== filterYear) matchesDate = false;
      if (filterMonth && (logDate.getMonth() + 1).toString() !== filterMonth) matchesDate = false;
    }

    return matchesSearch && matchesDate;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.purchaseDate || a.createdAt).getTime() - new Date(b.purchaseDate || b.createdAt).getTime();
    } else if (sortBy === 'poNumber') {
      comparison = (a.poNumber || '').localeCompare(b.poNumber || '');
    } else if (sortBy === 'vendor') {
      comparison = (a.vendorName || '').localeCompare(b.vendorName || '');
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const availableYears = Array.from(new Set(purchaseOrders.map(po => new Date(po.purchaseDate || po.createdAt).getFullYear().toString()))).sort((a, b) => Number(b) - Number(a));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Purchase Orders</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="search-container" style={{ position: 'relative', width: '300px' }}>
            <i className="fi fi-rr-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}></i>
            <input 
              type="text" 
              placeholder="Search PO number or vendor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '48px' }}
            />
          </div>
          <Link href="/material-management/purchase-order" className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', height: '100%', display: 'flex', alignItems: 'center' }}>
            + Create New PO
          </Link>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fi fi-rr-filter" style={{ opacity: 0.5 }}></i>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Filters:</span>
        </div>
        
        <CustomDropdown
          value={filterYear}
          onChange={setFilterYear}
          placeholder="All Years"
          options={[
            { label: 'All Years', value: '' },
            ...availableYears.map(y => ({ label: y, value: y }))
          ]}
          style={{ width: '130px' }}
        />

        <CustomDropdown
          value={filterMonth}
          onChange={setFilterMonth}
          placeholder="All Months"
          options={[
            { label: 'All Months', value: '' },
            { label: 'January', value: '1' },
            { label: 'February', value: '2' },
            { label: 'March', value: '3' },
            { label: 'April', value: '4' },
            { label: 'May', value: '5' },
            { label: 'June', value: '6' },
            { label: 'July', value: '7' },
            { label: 'August', value: '8' },
            { label: 'September', value: '9' },
            { label: 'October', value: '10' },
            { label: 'November', value: '11' },
            { label: 'December', value: '12' }
          ]}
          style={{ width: '150px' }}
        />

        <div style={{ borderLeft: '1px solid var(--input-border)', height: '24px', margin: '0 8px' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fi fi-rr-sort-alt" style={{ opacity: 0.5 }}></i>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Sort:</span>
        </div>

        <CustomDropdown
          value={sortBy}
          onChange={setSortBy}
          options={[
            { label: 'Date', value: 'date' },
            { label: 'PO Number', value: 'poNumber' },
            { label: 'Vendor', value: 'vendor' }
          ]}
          style={{ width: '140px' }}
        />

        <CustomDropdown
          value={sortOrder}
          onChange={setSortOrder}
          options={[
            { label: 'Descending (Newest First)', value: 'desc' },
            { label: 'Ascending (Oldest First)', value: 'asc' }
          ]}
          style={{ width: '240px' }}
        />

        {(filterYear || filterMonth || searchTerm || sortBy !== 'date' || sortOrder !== 'desc') && (
          <button 
            onClick={() => {
              setFilterYear('');
              setFilterMonth('');
              setSearchTerm('');
              setSortBy('date');
              setSortOrder('desc');
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--danger, #ef4444)', 
              cursor: 'pointer', 
              fontSize: '0.9rem',
              fontWeight: 600,
              marginLeft: 'auto'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        {loading ? (
           <div style={{ padding: '24px', textAlign: 'center' }}>Loading Purchase Orders...</div>
        ) : filteredPOs.length === 0 ? (
           <div style={{ padding: '24px', textAlign: 'center' }}>No Purchase Orders found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--input-border)' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>PO Number</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Vendor</th>
                <th style={{ padding: '12px' }}>Amount (Incl. GST/Freight)</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.map((po) => (
                <tr key={po.id} style={{ borderBottom: '1px solid var(--input-border)' }}>
                  <td style={{ padding: '12px' }}>{po.id}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{po.poNumber}</td>
                  <td style={{ padding: '12px' }}>{po.purchaseDate}</td>
                  <td style={{ padding: '12px' }}>{po.vendorName}</td>
                  <td style={{ padding: '12px' }}>
                    {/* Calculate rough total based on db items if needed, or simply display */}
                    -
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Link href={`/material-management/purchase-order?id=${po.id}`} className="btn-secondary" style={{ padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      Edit / View
                    </Link>
                    <button onClick={() => handleDelete(po.id)} className="btn-primary" style={{ background: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
