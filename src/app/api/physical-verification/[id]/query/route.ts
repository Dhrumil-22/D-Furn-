import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid verification ID' }, { status: 400 });
    }

    const { queryMessage } = await request.json();
    if (!queryMessage) {
      return NextResponse.json({ error: 'Query message is required' }, { status: 400 });
    }

    const updatedVerification = await prisma.physicalVerification.update({
      where: { id },
      data: {
        queryMessage,
        queryResolved: false,
      },
    });

    let userName = 'System';
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded && decoded.name) {
        userName = decoded.name;
      }
    }

    await prisma.systemLog.create({
      data: {
        module: 'PHYSICAL_VERIFICATION',
        action: 'QUERY_RAISED',
        description: `Query raised: "${queryMessage}"`,
        referenceId: id.toString(),
        userName: userName,
      }
    });

    return NextResponse.json(updatedVerification);
  } catch (error: any) {
    console.error('Error raising query:', error);
    return NextResponse.json({ error: error.message || 'Failed to raise query' }, { status: 500 });
  }
}
