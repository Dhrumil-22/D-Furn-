import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  
  if (!dateStr) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  try {
    const count = await prisma.purchaseOrder.count({
      where: {
        purchaseDate: dateStr
      }
    });

    const nextSeq = (count + 1).toString().padStart(3, '0');
    
    const d = new Date(dateStr);
    const dd = d.getDate().toString().padStart(2, '0');
    const mmm = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    
    const generatedId = `PO-${dd}${mmm}-${nextSeq}`;

    return NextResponse.json({ generatedId, sequence: nextSeq });
  } catch (error) {
    console.error('Failed to generate PO sequence:', error);
    return NextResponse.json({ error: 'Failed to generate sequence' }, { status: 500 });
  }
}
