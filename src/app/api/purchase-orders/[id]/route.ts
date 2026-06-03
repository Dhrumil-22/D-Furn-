import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(id) },
      include: { 
        items: true
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase order' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { items, ...poData } = data;

    let userName = 'System';
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded && decoded.name) {
        userName = decoded.name;
      }
    }

    // We use a transaction to delete old items and insert new ones
    const updatedPO = await prisma.$transaction(async (tx) => {
      await tx.pOItem.deleteMany({
        where: { purchaseOrderId: parseInt(id) },
      });

      return await tx.purchaseOrder.update({
        where: { id: parseInt(id) },
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
          }
        },
        include: { items: true },
      });
    });

    await prisma.systemLog.create({
      data: {
        module: 'PURCHASE_ORDER',
        action: 'UPDATED',
        description: `Purchase order updated by ${userName}`,
        referenceId: updatedPO.poNumber || updatedPO.id.toString(),
        userName: userName,
      }
    });

    return NextResponse.json(updatedPO);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    return NextResponse.json({ error: 'Failed to update purchase order' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedPO = await prisma.purchaseOrder.delete({
      where: { id: parseInt(id) },
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
        module: 'PURCHASE_ORDER',
        action: 'DELETED',
        description: `Purchase order deleted by ${userName}`,
        referenceId: deletedPO.poNumber || id,
        userName: userName,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    return NextResponse.json({ error: 'Failed to delete purchase order' }, { status: 500 });
  }
}
