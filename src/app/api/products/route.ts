import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Extract image
    const image = formData.get('image') as File | null;
    let imagePath = null;
    
    if (image && image.name) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filename = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);
      imagePath = `/uploads/${filename}`;
    }
    
    // Map form data to Prisma
    const data = {
      materialCategory: formData.get('materialCategory') as string || null,
      itemCode: formData.get('itemCode') as string || null,
      itemName: formData.get('itemName') as string,
      mainCategory: formData.get('mainCategory') as string || null,
      subCategory: formData.get('subCategory') as string || null,
      attribute1: formData.get('attribute1') as string || null,
      attribute2: formData.get('attribute2') as string || null,
      attribute3: formData.get('attribute3') as string || null,
      attribute4: formData.get('attribute4') as string || null,
      attribute5: formData.get('attribute5') as string || null,
      attribute6: formData.get('attribute6') as string || null,
      attribute7: formData.get('attribute7') as string || null,
      vendorName: formData.get('vendorName') as string || null,
      procureUnit: formData.get('procureUnit') as string || null,
      costingUnit: formData.get('costingUnit') as string || null,
      issueUnit: formData.get('issueUnit') as string || null,
      procuredUnitCost: formData.get('procuredUnitCost') ? parseFloat(formData.get('procuredUnitCost') as string) : null,
      costingUnitCost: formData.get('costingUnitCost') ? parseFloat(formData.get('costingUnitCost') as string) : null,
      issuedUnitCost: formData.get('issuedUnitCost') ? parseFloat(formData.get('issuedUnitCost') as string) : null,
      openingStock: formData.get('openingStock') ? parseFloat(formData.get('openingStock') as string) : null,
      storageLocation: formData.get('storageLocation') as string || null,
      reOrderLevel: formData.get('reOrderLevel') ? parseInt(formData.get('reOrderLevel') as string, 10) : null,
      image: imagePath,
      physicalStock: formData.get('physicalStock') ? parseFloat(formData.get('physicalStock') as string) : null,
      physicalStockLastUpdatedOn: formData.get('physicalStockLastUpdatedOn') ? new Date(formData.get('physicalStockLastUpdatedOn') as string) : null,
      verificationFrequency: formData.get('verificationFrequency') ? parseInt(formData.get('verificationFrequency') as string, 10) : null,
    };
    
    const product = await prisma.product.create({
      data,
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
