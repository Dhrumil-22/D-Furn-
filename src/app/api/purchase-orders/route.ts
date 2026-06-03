import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' },
    });
    console.log("=== /api/purchase-orders GET ===");
    console.log("Result:", purchaseOrders);
    console.log("IsArray:", Array.isArray(purchaseOrders));
    return NextResponse.json(purchaseOrders);
  } catch (error: any) {
    console.error('=== Error in GET /api/purchase-orders ===');
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to fetch' }, { status: 500 });
  }
}

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { items, ...poData } = data;

    // Determine the user making the request
    let userName = 'System';
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded && decoded.name) {
        userName = decoded.name;
      }
    }

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        ...poData,
        items: {
          create: items.map((item: any) => ({
            code: item.code,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            rate: item.rate,
          })),
        },
      },
      include: { items: true },
    });

    // Write to SystemLog
    await prisma.systemLog.create({
      data: {
        module: 'PURCHASE_ORDER',
        action: 'CREATED',
        description: `Purchase order created by ${userName}`,
        referenceId: purchaseOrder.poNumber || purchaseOrder.id.toString(),
        userName: userName,
      }
    });

    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 });
  }
}
