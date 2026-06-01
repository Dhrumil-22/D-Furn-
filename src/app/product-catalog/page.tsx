import Link from 'next/link';
import prisma from '@/lib/prisma';
import ProductList from './ProductList';
export default async function ProductCatalogPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>SKU Management (Products)</h2>
        <Link href="/product-catalog/add" className="btn-primary">
          + Add Product
        </Link>
      </div>

      <ProductList initialProducts={products} />
    </div>
  );
}
