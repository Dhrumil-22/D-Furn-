import MaterialManagementNav from '@/components/MaterialManagementNav';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default async function MaterialManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  let userRole = 'SUPERADMIN';

  if (token) {
    const decoded = await verifyToken(token);
    if (decoded) {
      userRole = decoded.role;
    }
  }

  if (userRole.toUpperCase() === 'VERIFIER') {
    return <div className="page-container">{children}</div>;
  }

  return (
    <div className="page-container">
      <div className="no-print" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>Material Management</h1>
        <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>Manage purchase orders, vendors, and inventory tracking.</p>
      </div>
      
      <div className="no-print">
        <MaterialManagementNav />
      </div>
      
      <div>
        {children}
      </div>
    </div>
  );
}
