import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const verifications = await prisma.physicalVerification.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(verifications);
  } catch (error: any) {
    console.error('Error fetching physical verifications:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Get user context from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let verifierName = 'Unknown Verifier';
    let verifierId = null;

    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        verifierName = decoded.name;
        verifierId = decoded.id;
      }
    }

    const data = await request.json();
    const { pvNumber, productId, date, physicalCount, verifierId: selectedVerifierId } = data;

    if (!productId || physicalCount === undefined || !selectedVerifierId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Try to get verifierName from DB based on selectedVerifierId
    const verifierUser = await prisma.user.findUnique({
      where: { id: parseInt(selectedVerifierId) }
    });
    
    if (verifierUser) {
      verifierId = verifierUser.id;
      verifierName = verifierUser.name;
    }

    // Fetch the product to get the current digital count (openingStock or physicalStock)
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    
    // Usually the digital count is the product's tracked stock. Let's use physicalStock if it exists, otherwise openingStock, otherwise 0.
    let digitalCount = 0;
    
    if (product) {
      digitalCount = product.physicalStock ?? product.openingStock ?? 0;
    } else {
      // Fallback for hardcoded products
      if (parseInt(productId) === 9991) digitalCount = 10;
      else if (parseInt(productId) === 9992) digitalCount = 25;
      else if (parseInt(productId) === 9993) digitalCount = 15;
      else return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const hasMismatch = parseFloat(physicalCount) !== digitalCount;

    const verification = await prisma.physicalVerification.create({
      data: {
        pvNumber: pvNumber || undefined,
        productId: parseInt(productId),
        verifierId,
        verifierName,
        date: new Date(date || Date.now()),
        physicalCount: parseFloat(physicalCount),
        digitalCount,
        hasMismatch,
      },
      include: { product: false } // Avoid Prisma trying to fetch relation for hardcoded IDs
    });

    await prisma.systemLog.create({
      data: {
        module: 'PHYSICAL_VERIFICATION',
        action: 'CREATED',
        description: `Physical Verification submitted for Product ID ${productId}. Count: ${physicalCount}${hasMismatch ? ' (Mismatch)' : ' (Matched)'}`,
        referenceId: verification.id.toString(),
        userName: verifierName,
      }
    });

    return NextResponse.json(verification, { status: 201 });
  } catch (error: any) {
    console.error('Error creating physical verification:', error);
    return NextResponse.json({ error: error.message || 'Failed to create' }, { status: 500 });
  }
}
