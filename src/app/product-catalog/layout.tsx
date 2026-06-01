import ProductCatalogNav from '@/components/ProductCatalogNav';

export default function ProductCatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>Product Catalogue</h1>
        <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>Manage your inventory, SKUs, rich media, and variants.</p>
      </div>
      
      <ProductCatalogNav />
      
      <div>
        {children}
      </div>
    </div>
  );
}
