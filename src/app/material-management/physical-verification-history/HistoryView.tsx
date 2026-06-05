'use client';

import { useState, useEffect } from 'react';

type HistoryViewProps = {
  verifiers: { id: number; name: string }[];
  loggedInUserId: number | null;
};

export default function HistoryView({ verifiers, loggedInUserId }: HistoryViewProps) {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerifier, setSelectedVerifier] = useState<string>(loggedInUserId ? loggedInUserId.toString() : '');

  useEffect(() => {
    fetchVerifications();
  }, []);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '8px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>Verification History</h1>
        <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>View past physical stock counts submitted by you.</p>
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Your Past Records</h3>
          
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <select 
              value={selectedVerifier} 
              onChange={(e) => setSelectedVerifier(e.target.value)}
              className="input-field"
            >
              <option value="">-- All Verifiers --</option>
              {verifiers.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ opacity: 0.7 }}>Loading history...</p>
        ) : verifications.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No past records found.</p>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--input-border)' }}>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Product</th>
                <th style={{ padding: '12px' }}>Physical Count</th>
                <th style={{ padding: '12px' }}>Verifier Name</th>
              </tr>
            </thead>
            <tbody>
              {verifications
                .filter(v => !selectedVerifier || v.verifierId === parseInt(selectedVerifier))
                .map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--input-border)' }}>
                  <td style={{ padding: '12px' }}>{new Date(v.date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{v.product?.itemName || `ID ${v.productId}`}</td>
                  <td style={{ padding: '12px' }}>{v.physicalCount}</td>
                  <td style={{ padding: '12px' }}>{v.verifierName || 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
