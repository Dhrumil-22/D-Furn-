import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const deletedProduct = await prisma.product.delete({
      where: { id: productId }
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
        module: 'INVENTORY',
        action: 'DELETED',
        description: `Product/Inventory item deleted: ${deletedProduct.itemName}`,
        referenceId: productId.toString(),
        userName: userName,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

import fs from 'fs';
import path from 'path';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          ...(body.websiteSync !== undefined && { websiteSync: body.websiteSync })
        }
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
          module: 'INVENTORY',
          action: 'UPDATED',
          description: `Product sync status updated: ${updatedProduct.itemName}`,
          referenceId: productId.toString(),
          userName: userName,
        }
      });

      return NextResponse.json({ success: true, product: updatedProduct });
    }

    // Otherwise, assume multipart/form-data for full edit
    const formData = await request.formData();
    
    // Extract image
    const image = formData.get('image') as File | null;
    let imagePath = undefined;
    
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
    
    const data: any = {
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
      physicalStock: formData.get('physicalStock') ? parseFloat(formData.get('physicalStock') as string) : null,
      physicalStockLastUpdatedOn: formData.get('physicalStockLastUpdatedOn') ? new Date(formData.get('physicalStockLastUpdatedOn') as string) : null,
      verificationFrequency: formData.get('verificationFrequency') ? parseInt(formData.get('verificationFrequency') as string, 10) : null,
    };

    if (imagePath) {
      data.image = imagePath;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data,
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
        module: 'INVENTORY',
        action: 'UPDATED',
        description: `Product details updated: ${updatedProduct.itemName}`,
        referenceId: productId.toString(),
        userName: userName,
      }
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
