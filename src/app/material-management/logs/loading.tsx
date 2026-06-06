export default function Loading() {
  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ width: '250px', height: '32px', backgroundColor: 'var(--input-bg)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
      </div>

      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ width: '150px', height: '40px', backgroundColor: 'var(--input-bg)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        ))}
      </div>

      <div className="glass-card table-responsive" style={{ padding: '24px' }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', borderBottom: '2px solid var(--input-border)', paddingBottom: '12px' }}>
            <div style={{ flex: 1, height: '20px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            <div style={{ flex: 1, height: '20px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', margin: '0 16px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            <div style={{ flex: 1, height: '20px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            <div style={{ flex: 2, height: '20px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', margin: '0 16px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            <div style={{ flex: 1, height: '20px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          </div>
          
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} style={{ display: 'flex', borderBottom: '1px solid var(--input-border)', paddingBottom: '12px' }}>
              <div style={{ flex: 1, height: '24px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
              <div style={{ flex: 1, height: '24px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', margin: '0 16px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
              <div style={{ flex: 1, height: '24px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
              <div style={{ flex: 2, height: '24px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', margin: '0 16px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
              <div style={{ flex: 1, height: '24px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
