import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import PhysicalVerificationView from './PhysicalVerificationView';
import prisma from '@/lib/prisma';

export default async function PhysicalVerificationPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  let role = 'VERIFIER'; // default to least privileged if not strictly mapped

  if (token) {
    const decoded = await verifyToken(token);
    if (decoded) {
      role = decoded.role;
    }
  }

  // Determine boolean flags based on role string (e.g. 'superadmin', 'admin', 'verifier')
  const isSuperadmin = role.toLowerCase() === 'superadmin' || role.toLowerCase() === 'admin';

  // Fetch verifiers list to populate the dropdown
  const verifiers = await prisma.user.findMany({
    where: { role: 'VERIFIER' },
    select: { id: true, name: true }
  });

  return (
    <div>
      <PhysicalVerificationView isSuperadmin={isSuperadmin} verifiers={verifiers} />
    </div>
  );
}
