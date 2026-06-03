'use client';

import { useState, useEffect } from 'react';
import CustomDropdown from '@/components/CustomDropdown';

export default function POAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const availableModules = [
    'Purchase Orders', 
    'Inward / Issue', 
    'Job Work In/Out', 
    'Physical Verification', 
    'Vendor Master', 
    'MSME Compliance', 
    'Multi-Vendor Pricing'
  ];

  const MODULE_MAPPING: Record<string, string> = {
    'PURCHASE_ORDER': 'Purchase Orders',
    'PHYSICAL_VERIFICATION': 'Physical Verification',
    'INVENTORY': 'Inward / Issue',
    'VENDOR_MASTER': 'Vendor Master',
    'JOB_WORK': 'Job Work In/Out',
    'MSME_COMPLIANCE': 'MSME Compliance',
    'MULTI_VENDOR_PRICING': 'Multi-Vendor Pricing'
  };

  const getMappedModule = (mod: string) => {
    return MODULE_MAPPING[mod] || mod;
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/system-logs');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch PO logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const mappedModule = getMappedModule(log.module);
    
    // Only allow these specific submodules
    if (!availableModules.includes(mappedModule)) return false;

    const searchLower = searchTerm.toLowerCase();
    const module = mappedModule.toLowerCase();
    const reference = (log.referenceId || '').toLowerCase();
    const description = (log.description || '').toLowerCase();
    const userName = (log.userName || '').toLowerCase();
    const action = (log.action || '').toLowerCase();

    const matchesSearch = searchTerm === '' || (
      module.includes(searchLower) ||
      reference.includes(searchLower) || 
      description.includes(searchLower) || 
      userName.includes(searchLower) ||
      action.includes(searchLower)
    );

    const matchesModule = filterModule === '' || mappedModule === filterModule;
    const matchesAction = filterAction === '' || log.action === filterAction;
    
    let matchesDate = true;
    if (filterYear || filterMonth) {
      const logDate = new Date(log.createdAt);
      if (filterYear && logDate.getFullYear().toString() !== filterYear) matchesDate = false;
      if (filterMonth && (logDate.getMonth() + 1).toString() !== filterMonth) matchesDate = false;
    }

    return matchesSearch && matchesModule && matchesAction && matchesDate;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === 'module') {
      comparison = getMappedModule(a.module).localeCompare(getMappedModule(b.module));
    } else if (sortBy === 'action') {
      comparison = (a.action || '').localeCompare(b.action || '');
    } else if (sortBy === 'user') {
      comparison = (a.userName || '').localeCompare(b.userName || '');
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const availableActions = Array.from(new Set(logs.map(l => l.action).filter(Boolean)));
  const availableYears = Array.from(new Set(logs.map(l => new Date(l.createdAt).getFullYear().toString()))).sort((a, b) => Number(b) - Number(a));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>System Logs</h2>
          <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '4px' }}>General audit trail for the entire system.</p>
        </div>
        <div style={{ width: '350px' }}>
          <div className="search-container" style={{ position: 'relative' }}>
            <i className="fi fi-rr-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}></i>
            <input 
              type="text" 
              placeholder="Search module, reference, user, or action..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '48px' }}
            />
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fi fi-rr-filter" style={{ opacity: 0.5 }}></i>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Filters:</span>
        </div>
        
        <CustomDropdown
          value={filterModule}
          onChange={setFilterModule}
          placeholder="All Modules"
          options={[
            { label: 'All Modules', value: '' },
            ...availableModules.map(m => ({ label: m, value: m }))
          ]}
          style={{ width: '180px' }}
        />

        <CustomDropdown
          value={filterAction}
          onChange={setFilterAction}
          placeholder="All Actions"
          options={[
            { label: 'All Actions', value: '' },
            ...availableActions.map(a => ({ label: a, value: a }))
          ]}
          style={{ width: '160px' }}
        />

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
            { label: 'Module', value: 'module' },
            { label: 'Action', value: 'action' },
            { label: 'User', value: 'user' }
          ]}
          style={{ width: '130px' }}
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

        {(filterModule || filterAction || filterYear || filterMonth || searchTerm || sortBy !== 'date' || sortOrder !== 'desc') && (
          <button 
            onClick={() => {
              setFilterModule('');
              setFilterAction('');
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

      <div className="glass-card" style={{ overflowX: 'auto', padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', opacity: 0.7 }}>Loading logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', opacity: 0.7 }}>No logs found matching your criteria.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--input-border)' }}>
                <th style={{ padding: '12px' }}>Timestamp</th>
                <th style={{ padding: '12px' }}>Module</th>
                <th style={{ padding: '12px' }}>Reference</th>
                <th style={{ padding: '12px' }}>Action</th>
                <th style={{ padding: '12px' }}>Description</th>
                <th style={{ padding: '12px' }}>User</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--input-border)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '12px', opacity: 0.7, fontSize: '0.9rem' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600, fontSize: '0.85rem' }}>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                      {getMappedModule(log.module)}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>
                    {log.referenceId || '-'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'inline-flex', padding: '4px 10px', backgroundColor: log.action === 'CREATED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: log.action === 'CREATED' ? '#10b981' : '#3b82f6', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {log.action}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>{log.description}</td>
                  <td style={{ padding: '12px' }}>{log.userName || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
