'use client';

import { useState, useEffect } from 'react';
import CustomDropdown from '@/components/CustomDropdown';

type PhysicalVerificationViewProps = {
  isSuperadmin: boolean;
  verifiers: { id: number; name: string }[];
};

export default function PhysicalVerificationView({ isSuperadmin, verifiers }: PhysicalVerificationViewProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State (Verifier)
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedVerifier, setSelectedVerifier] = useState('');
  const [physicalCount, setPhysicalCount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [pvNumber, setPvNumber] = useState('');
  const [submittedEntry, setSubmittedEntry] = useState<any>(null);
  const [queryText, setQueryText] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);

  // Superadmin Filters
  const [searchProduct, setSearchProduct] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterVerifier, setFilterVerifier] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('DATE_DESC');

  const filteredVerifications = verifications.filter(v => {
    // Product Search
    const productName = v.product?.itemName || `Product ID ${v.productId}`;
    if (searchProduct && productName !== searchProduct) return false;
    
    // Status Filter
    if (filterStatus === 'MATCHED' && v.hasMismatch) return false;
    if (filterStatus === 'MISMATCH' && !v.hasMismatch) return false;
    
    // Verifier Filter
    if (filterVerifier && v.verifierName !== filterVerifier) return false;
    
    // Date Range Filter
    if (filterStartDate) {
      const vDate = new Date(v.date);
      vDate.setHours(0,0,0,0);
      const sDate = new Date(filterStartDate);
      sDate.setHours(0,0,0,0);
      if (vDate < sDate) return false;
    }
    if (filterEndDate) {
      const vDate = new Date(v.date);
      vDate.setHours(0,0,0,0);
      const eDate = new Date(filterEndDate);
      eDate.setHours(0,0,0,0);
      if (vDate > eDate) return false;
    }
    
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'DATE_DESC' ? dateB - dateA : dateA - dateB;
  });

  const uniqueVerifiers = Array.from(new Set(verifications.map(v => v.verifierName).filter(Boolean)));
  const uniqueProducts = Array.from(new Set(verifications.map(v => v.product?.itemName || `Product ID ${v.productId}`).filter(Boolean)));

  useEffect(() => {
    if (isSuperadmin) {
      fetchVerifications();
    } else {
      fetchProducts();
      // Auto-generate initial PV Number for today
      handleDateChange(new Date().toISOString().split('T')[0]);
    }
  }, [isSuperadmin]);

  const handleDateChange = async (newDate: string) => {
    setDate(newDate);
    if (newDate) {
      try {
        const res = await fetch(`/api/physical-verification/next-sequence?date=${newDate}`);
        const data = await res.json();
        if (data.generatedId) {
          setPvNumber(data.generatedId);
        }
      } catch (error) {
        console.error('Failed to fetch next PV sequence:', error);
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      
      const hardcodedProducts = [
        { id: 9991, itemName: 'Hardcoded Executive Desk', itemCode: 'HED-01', physicalStock: 10 },
        { id: 9992, itemName: 'Hardcoded Mesh Chair', itemCode: 'HMC-05', physicalStock: 25 },
        { id: 9993, itemName: 'Hardcoded Filing Cabinet', itemCode: 'HFC-02', physicalStock: 15 },
      ];

      if (Array.isArray(data) && data.length > 0) {
        setProducts([...data, ...hardcodedProducts]);
      } else {
        setProducts(hardcodedProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
      // Fallback to hardcoded products on error
      setProducts([
        { id: 9991, itemName: 'Hardcoded Executive Desk', itemCode: 'HED-01', physicalStock: 10 },
        { id: 9992, itemName: 'Hardcoded Mesh Chair', itemCode: 'HMC-05', physicalStock: 25 },
        { id: 9993, itemName: 'Hardcoded Filing Cabinet', itemCode: 'HFC-02', physicalStock: 15 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifications = async () => {
    try {
      const res = await fetch('/api/physical-verification');
      const data = await res.json();
      if (Array.isArray(data)) setVerifications(data);
    } catch (error) {
      console.error('Failed to fetch verifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !physicalCount || !selectedVerifier) return alert('Please fill in all required fields');

    try {
      const res = await fetch('/api/physical-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pvNumber,
          productId: selectedProduct,
          verifierId: selectedVerifier,
          physicalCount,
          date,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmittedEntry(data);
        setShowSuccessModal(true);
      } else {
        alert(data.error || 'Failed to submit');
      }
    } catch (error) {
      console.error(error);
      alert('Error submitting physical count');
    }
  };

  const handleRaiseQuery = async () => {
    if (!queryText) return alert('Enter a query message');
    try {
      const res = await fetch(`/api/physical-verification/${submittedEntry.id}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryMessage: queryText }),
      });
      if (res.ok) {
        alert('Query raised successfully to Superadmin');
        setQueryText('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to raise query');
      }
    } catch (error) {
      console.error(error);
      alert('Error raising query');
    }
  };

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>;
  }

  // --- SUPERADMIN DASHBOARD ---
  if (isSuperadmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>Physical Verification Audits</h2>
          <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '4px' }}>Track and manage physical inventory verifications.</p>
        </div>
        
        {/* Filters */}
        <div className="filter-container">
          <div className="filter-group">
            <label>Product</label>
            <CustomDropdown
              className="filter-item"
              value={searchProduct}
              onChange={setSearchProduct}
              options={[
                { label: 'All Products', value: '' },
                ...uniqueProducts.map((name: any) => ({ label: name, value: name }))
              ]}
              placeholder="All Products"
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <CustomDropdown
              className="filter-item"
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { label: 'All Statuses', value: 'ALL' },
                { label: 'Matched', value: 'MATCHED' },
                { label: 'Mismatch', value: 'MISMATCH' }
              ]}
              placeholder="All Statuses"
            />
          </div>
          <div className="filter-group">
            <label>Verifier</label>
            <CustomDropdown
              className="filter-item"
              value={filterVerifier}
              onChange={setFilterVerifier}
              options={[
                { label: 'All Verifiers', value: '' },
                ...uniqueVerifiers.map((name: any) => ({ label: name, value: name }))
              ]}
              placeholder="All Verifiers"
            />
          </div>
          <div className="filter-group">
            <label>Start Date</label>
            <input type="date" className="input-field" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input type="date" className="input-field" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Sort By</label>
            <CustomDropdown
              className="filter-item"
              value={sortOrder}
              onChange={setSortOrder}
              options={[
                { label: 'Date: Newest First', value: 'DATE_DESC' },
                { label: 'Date: Oldest First', value: 'DATE_ASC' }
              ]}
              placeholder="Sort By"
            />
          </div>
        </div>

        {filteredVerifications.length === 0 ? (
          <p style={{ textAlign: 'center', opacity: 0.7 }}>No physical verifications submitted yet.</p>
        ) : (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--input-border)' }}>
                <th style={{ padding: '12px', width: '50px' }}>No.</th>
                <th style={{ padding: '12px' }}>Verification ID</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Product</th>
                <th style={{ padding: '12px' }}>Digital Count</th>
                <th style={{ padding: '12px' }}>Physical Count</th>
                <th style={{ padding: '12px' }}>Verifier</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVerifications.map((v, index) => (
                <tr 
                  key={v.id} 
                  onClick={() => setSelectedAudit(v)}
                  style={{ 
                    borderBottom: '1px solid var(--input-border)', 
                    backgroundColor: v.hasMismatch ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    height: '60px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = v.hasMismatch ? 'rgba(239, 68, 68, 0.05)' : 'transparent'}
                >
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{sortOrder.includes('DESC') ? filteredVerifications.length - index : index + 1}</td>
                  <td style={{ padding: '12px' }}>{v.pvNumber || `PV-${new Date(v.date).getDate().toString().padStart(2, '0')}${new Date(v.date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}-${v.id.toString().padStart(3, '0')}`}</td>
                  <td style={{ padding: '12px' }}>{new Date(v.date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{v.product?.itemName || `Product ID ${v.productId}`}</td>
                  <td style={{ padding: '12px' }}>{v.digitalCount}</td>
                  <td style={{ padding: '12px' }}>{v.physicalCount}</td>
                  <td style={{ padding: '12px' }}>{v.verifierName || 'Unknown'}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                      {v.hasMismatch ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                          Mismatch
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                          Matched
                        </div>
                      )}
                      {v.queryMessage && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 2s infinite' }} />
                          Query
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
          </div>
        )}

        {/* Audit Details Modal */}
        {selectedAudit && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out'
          }} onClick={() => setSelectedAudit(null)}>
            <div className="glass-card" style={{ 
              padding: '32px', maxWidth: '600px', width: '90%', 
              animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              position: 'relative'
            }} onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setSelectedAudit(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.6 }}
              >×</button>
              
              <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--input-border)' }}>Audit Details</h2>
              
              <div className="responsive-grid-2" style={{ gap: '20px', marginBottom: '24px' }}>
                <div><span style={{ opacity: 0.7, fontSize: '0.9rem', display: 'block' }}>Verification ID</span> <strong style={{ fontSize: '1.1rem' }}>{selectedAudit.pvNumber || `PV-${new Date(selectedAudit.date).getDate().toString().padStart(2, '0')}${new Date(selectedAudit.date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}-${selectedAudit.id.toString().padStart(3, '0')}`}</strong></div>
                <div><span style={{ opacity: 0.7, fontSize: '0.9rem', display: 'block' }}>Product</span> <strong style={{ fontSize: '1.1rem' }}>{selectedAudit.product?.itemName || `Product ID ${selectedAudit.productId}`}</strong></div>
                <div><span style={{ opacity: 0.7, fontSize: '0.9rem', display: 'block' }}>Verifier</span> <strong style={{ fontSize: '1.1rem' }}>{selectedAudit.verifierName || 'Unknown'}</strong></div>
                <div><span style={{ opacity: 0.7, fontSize: '0.9rem', display: 'block' }}>Date</span> <strong style={{ fontSize: '1.1rem' }}>{new Date(selectedAudit.date).toLocaleString()}</strong></div>
                <div>
                  <span style={{ opacity: 0.7, fontSize: '0.9rem', display: 'block' }}>Status</span> 
                  {selectedAudit.hasMismatch ? 
                    <strong style={{ fontSize: '1.1rem', color: '#ef4444' }}>Mismatch</strong> : 
                    <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>Matched</strong>
                  }
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1, padding: '16px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--input-border)' }}>
                  <div style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '4px' }}>System Digital Count</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedAudit.digitalCount}</div>
                </div>
                <div style={{ flex: 1, padding: '16px', backgroundColor: selectedAudit.hasMismatch ? 'rgba(239, 68, 68, 0.1)' : 'var(--card-bg)', borderRadius: '8px', border: selectedAudit.hasMismatch ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--input-border)' }}>
                  <div style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '4px', color: selectedAudit.hasMismatch ? '#ef4444' : 'inherit' }}>Physical Count</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: selectedAudit.hasMismatch ? '#ef4444' : 'inherit' }}>{selectedAudit.physicalCount}</div>
                </div>
              </div>

              {selectedAudit.queryMessage && (
                <div style={{ padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Verifier Query</div>
                  <div style={{ fontStyle: 'italic', lineHeight: 1.5 }}>"{selectedAudit.queryMessage}"</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VERIFIER DASHBOARD ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '8px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>Physical Verification</h1>
        <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>Record the physical stock and submit queries.</p>
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Record Physical Stock</h2>
        
        <form onSubmit={handleSubmitCount} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="responsive-grid-2">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Select Product</label>
              <CustomDropdown
                value={selectedProduct}
                onChange={setSelectedProduct}
                options={products.map(p => ({ label: `${p.itemName} (${p.itemCode})`, value: p.id.toString() }))}
                placeholder="-- Choose a Product --"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Your Name (Verifier)</label>
              <CustomDropdown
                value={selectedVerifier}
                onChange={setSelectedVerifier}
                options={verifiers.map(v => ({ label: v.name, value: v.id.toString() }))}
                placeholder="-- Select Your Name --"
              />
            </div>
          </div>
          
          <div className="responsive-grid-2">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Verification ID (PV Number)</label>
              <input 
                type="text" 
                value={pvNumber} 
                onChange={(e) => setPvNumber(e.target.value)} 
                className="input-field"
                placeholder="e.g. PV-2026-001"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Date of Verification</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => handleDateChange(e.target.value)} 
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Physical Count Amount</label>
              <input 
                type="number" 
                step="0.01"
                value={physicalCount} 
                onChange={(e) => setPhysicalCount(e.target.value)} 
                className="input-field"
                placeholder="e.g. 50"
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '16px', padding: '12px' }}>
            Submit Physical Verification
          </button>
        </form>
      </div>

      {submittedEntry && (
        <div className="glass-card" style={{ padding: '32px', borderLeft: '4px solid var(--primary)', animation: 'slideUp 0.5s ease-out forwards' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Submission Details</h3>
          <div className="responsive-grid-2" style={{ gap: '16px', marginBottom: '24px', fontSize: '0.95rem' }}>
            <div><span style={{ opacity: 0.7 }}>Product:</span> <strong>{submittedEntry.product?.itemName || `Hardcoded Product ID ${submittedEntry.productId}`}</strong></div>
            <div><span style={{ opacity: 0.7 }}>Date:</span> <strong>{new Date(submittedEntry.date).toLocaleDateString()}</strong></div>
            <div><span style={{ opacity: 0.7 }}>Your Count:</span> <strong>{submittedEntry.physicalCount}</strong></div>
          </div>

          <div style={{ borderTop: '1px solid var(--input-border)', paddingTop: '24px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '1rem' }}>Raise a Query to Superadmin</h4>
            <textarea 
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="input-field"
              placeholder="Explain the mismatch or add notes for the superadmin..."
              style={{ minHeight: '100px', marginBottom: '12px', resize: 'vertical' }}
            />
            <button onClick={handleRaiseQuery} className="btn-secondary" style={{ padding: '8px 16px' }}>
              Submit Query
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div className="glass-card" style={{ 
            padding: '40px', maxWidth: '400px', width: '90%', textAlign: 'center',
            animation: 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
          }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px auto', fontSize: '2.5rem',
              animation: 'bounceIn 0.6s cubic-bezier(0.280, 0.840, 0.420, 1) 0.2s both'
            }}>
              ✓
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Success!</h3>
            <p style={{ opacity: 0.8, marginBottom: '32px' }}>
              The physical stock has been successfully recorded.
            </p>
            <button onClick={() => setShowSuccessModal(false)} className="btn-primary" style={{ padding: '12px 32px', width: '100%' }}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}} />
    </div>
  );
}
