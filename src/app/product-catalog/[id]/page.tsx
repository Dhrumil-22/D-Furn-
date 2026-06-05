import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeleteProductButton from '@/components/DeleteProductButton';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  // Await params for Next.js 15
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

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/product-catalog" style={{ textDecoration: 'none', color: 'var(--foreground)', fontSize: '1.5rem' }}>
            &larr;
          </Link>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Product Details</h2>
        </div>
        <DeleteProductButton id={product.id} itemName={product.itemName || 'this product'} />
      </div>

      <div className="responsive-grid-1-2" style={{ gap: '32px' }}>
        {/* Left Column - Image & Hero Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.itemName} 
                style={{ width: '100%', height: 'auto', display: 'block', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} 
              />
            ) : (
              <div style={{ width: '100%', height: '300px', backgroundColor: 'var(--input-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                No Image Available
              </div>
            )}
            <div style={{ padding: '24px' }}>
              <h1 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '8px' }}>{product.itemName}</h1>
              <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '4px' }}>Code: <strong>{product.itemCode || 'N/A'}</strong></p>
              <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, marginTop: '8px' }}>
                {product.mainCategory || 'Uncategorized'} &rsaquo; {product.subCategory || 'No Sub-category'}
              </div>
            </div>
          </div>
          
          {/* Verification Box */}
          <div className="glass-card" style={{ backgroundColor: 'var(--input-bg)' }}>
            <h3 style={{ borderBottom: '1px solid var(--sidebar-border)', paddingBottom: '12px', marginBottom: '16px', fontSize: '1.1rem' }}>Verification</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Last Updated:</span>
                <span style={{ fontWeight: 500 }}>{product.physicalStockLastUpdatedOn ? new Date(product.physicalStockLastUpdatedOn).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Frequency:</span>
                <span style={{ fontWeight: 500 }}>{product.verificationFrequency ? `${product.verificationFrequency} Days` : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Data Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Attributes */}
          <div className="glass-card">
            <h3 style={{ borderBottom: '1px solid var(--sidebar-border)', paddingBottom: '12px', marginBottom: '16px', color: 'var(--primary)' }}>Attributes & Classification</h3>
            <div className="responsive-grid-2">
              <DataRow label="Material Category" value={product.materialCategory} />
              <DataRow label="Vendor Name" value={product.vendorName} />
              <DataRow label="Attribute 1" value={product.attribute1} />
              <DataRow label="Attribute 2" value={product.attribute2} />
              <DataRow label="Attribute 3" value={product.attribute3} />
              <DataRow label="Attribute 4" value={product.attribute4} />
              <DataRow label="Attribute 5" value={product.attribute5} />
              <DataRow label="Attribute 6" value={product.attribute6} />
              <DataRow label="Attribute 7" value={product.attribute7} />
            </div>
          </div>

          {/* Metrics & Financials */}
          <div className="glass-card">
            <h3 style={{ borderBottom: '1px solid var(--sidebar-border)', paddingBottom: '12px', marginBottom: '16px', color: 'var(--primary)' }}>Unit Cost & Metrics</h3>
            <div className="responsive-grid-2">
              <DataRow label="Procure Unit" value={product.procureUnit} />
              <DataRow label="Procured Unit Cost" value={product.procuredUnitCost ? `₹${product.procuredUnitCost.toFixed(2)}` : null} />
              <DataRow label="Costing Unit" value={product.costingUnit} />
              <DataRow label="Costing Unit Cost" value={product.costingUnitCost ? `₹${product.costingUnitCost.toFixed(2)}` : null} />
              <DataRow label="Issue Unit" value={product.issueUnit} />
              <DataRow label="Issued Unit Cost" value={product.issuedUnitCost ? `₹${product.issuedUnitCost.toFixed(2)}` : null} />
            </div>
          </div>

          {/* Stock */}
          <div className="glass-card">
            <h3 style={{ borderBottom: '1px solid var(--sidebar-border)', paddingBottom: '12px', marginBottom: '16px', color: 'var(--primary)' }}>Stock & Storage</h3>
            <div className="responsive-grid-2">
              <DataRow label="Storage Location" value={product.storageLocation} />
              <DataRow label="Re-Order Level" value={product.reOrderLevel} />
              <DataRow label="Opening Stock" value={product.openingStock} />
              <DataRow label="Physical Stock" value={product.physicalStock} highlight />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Simple helper component for consistent data rows
function DataRow({ label, value, highlight = false }: { label: string, value: any, highlight?: boolean }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: highlight ? 'rgba(59, 130, 246, 0.05)' : 'transparent', padding: highlight ? '8px' : '0', borderRadius: highlight ? '6px' : '0' }}>
      <span style={{ fontSize: '0.85rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <span style={{ fontSize: '1rem', fontWeight: highlight ? 700 : 500, color: highlight ? 'var(--primary)' : 'var(--foreground)' }}>{value}</span>
    </div>
  );
}
