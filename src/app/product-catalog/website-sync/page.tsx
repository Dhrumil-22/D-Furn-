import prisma from '@/lib/prisma';
import CategoryManagement from './CategoryManagement';

export default async function WebsiteSyncPage() {
  const categories = await prisma.category.findMany({
    orderBy: { id: 'asc' }
  });

  return (
    <div>
      <CategoryManagement initialCategories={categories} />
    </div>
  );
}
