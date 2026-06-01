import prisma from '@/lib/prisma';

export default async function CategoryHierarchyPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ mainCategory: 'asc' }, { subCategory: 'asc' }, { itemName: 'asc' }]
  });

  // Group by mainCategory -> subCategory
  const hierarchy: Record<string, Record<string, any[]>> = {};

  products.forEach((p: any) => {
    const main = p.mainCategory || 'Uncategorized';
    const sub = p.subCategory || 'General';
    
    if (!hierarchy[main]) hierarchy[main] = {};
    if (!hierarchy[main][sub]) hierarchy[main][sub] = [];
    
    hierarchy[main][sub].push(p);
  });

  return (
    <div className="glass-card" style={{ padding: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Category Hierarchy Tree</h2>
        <p style={{ opacity: 0.7 }}>View all products structured strictly by their Master and Sub-category.</p>
      </div>
      
      {Object.keys(hierarchy).length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--input-bg)', borderRadius: '12px' }}>
          <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>No products found in the catalog.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(hierarchy).map(([mainCat, subCats]) => (
            <div key={mainCat} style={{ border: '1px solid var(--sidebar-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              
              {/* Main Category Header */}
              <div style={{ backgroundColor: 'var(--input-bg)', padding: '16px 24px', fontWeight: 800, fontSize: '1.1rem', borderBottom: '1px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '32px', height: '32px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fi fi-rr-folder"></i>
                </span>
                {mainCat}
              </div>
              
              {/* Sub Categories */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: 'var(--card-bg)' }}>
                {Object.entries(subCats).map(([subCat, items]) => (
                  <div key={subCat} style={{ paddingLeft: '24px', borderLeft: '2px solid var(--primary)' }}>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '16px', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fi fi-rr-folder-open" style={{ opacity: 0.5 }}></i> {subCat} 
                      <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '12px', opacity: 0.7 }}>{items.length} items</span>
                    </h4>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      {items.map((item: any) => (
                        <div key={item.id} style={{ 
                          backgroundColor: '#ffffff', 
                          padding: '8px 16px', 
                          borderRadius: '8px', 
                          fontSize: '0.9rem', 
                          border: '1px solid var(--input-border)',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontWeight: 600 }}>{item.itemName}</span>
                          {item.itemCode && (
                            <span style={{ opacity: 0.6, fontSize: '0.8rem', paddingLeft: '8px', borderLeft: '1px solid var(--input-border)' }}>
                              {item.itemCode}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
