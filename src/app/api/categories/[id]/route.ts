import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
        ...(body.type && { type: body.type }),
      }
    });

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
