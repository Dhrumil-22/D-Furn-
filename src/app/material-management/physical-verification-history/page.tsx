import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import HistoryView from './HistoryView';
import prisma from '@/lib/prisma';

export default async function PhysicalVerificationHistoryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  let role = 'VERIFIER';
  let userId = null;

  if (token) {
    const decoded = await verifyToken(token);
    if (decoded) {
      role = decoded.role;
      userId = decoded.id;
    }
  }

  // Fetch verifiers list to allow filtering by verifier
  const verifiers = await prisma.user.findMany({
    where: { role: 'VERIFIER' },
    select: { id: true, name: true }
  });

  return (
    <div>
      <HistoryView verifiers={verifiers} loggedInUserId={userId} />
    </div>
  );
}
