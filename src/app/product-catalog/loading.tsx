export default function Loading() {
  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ width: '200px', height: '32px', backgroundColor: 'var(--input-bg)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '120px', height: '40px', backgroundColor: 'var(--input-bg)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          <div style={{ width: '150px', height: '40px', backgroundColor: 'var(--input-bg)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card" style={{ padding: '24px', minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'pulse 1.5s infinite ease-in-out', backgroundColor: 'var(--input-bg)' }}>
            <div style={{ width: '40%', height: '16px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
            <div style={{ width: '70%', height: '32px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '32px', display: 'flex', gap: '16px' }}>
        <div style={{ width: '250px', height: '40px', backgroundColor: 'var(--input-bg)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        <div style={{ width: '150px', height: '40px', backgroundColor: 'var(--input-bg)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        <div style={{ width: '150px', height: '40px', backgroundColor: 'var(--input-bg)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
      </div>

      {/* Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--input-bg)', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '80%', height: '20px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
              <div style={{ width: '50%', height: '16px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
              <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--input-border)', margin: '8px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '30%', height: '24px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
                <div style={{ width: '30%', height: '24px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
