import prisma from '@/lib/prisma';
import EditProductForm from './EditProductForm';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);
  
  if (isNaN(productId)) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    notFound();
  }

  return <EditProductForm initialData={product} />;
}
