'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProductForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData.image || null);
  
  // Try to parse out the dynamic parts of the item name if possible, or just default to initialData
  const [mainCategory, setMainCategory] = useState(initialData.mainCategory || '');
  const [subCategory, setSubCategory] = useState(initialData.subCategory || '');
  
  // Reconstruct attributes array from the individual fields
  const initialAttributes = [];
  for (let i = 1; i <= 7; i++) {
    const attr = initialData[`attribute${i}`];
    if (attr) initialAttributes.push(attr);
  }
  if (initialAttributes.length === 0) initialAttributes.push('');

  const [attributes, setAttributes] = useState<string[]>(initialAttributes);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const addAttribute = () => {
    if (attributes.length < 7) {
      setAttributes([...attributes, '']);
    }
  };

  const removeAttribute = (index: number) => {
    const newAttrs = attributes.filter((_, i) => i !== index);
    setAttributes(newAttrs.length > 0 ? newAttrs : ['']);
  };

  const handleAttributeChange = (index: number, value: string) => {
    const newAttrs = [...attributes];
    newAttrs[index] = value;
    setAttributes(newAttrs);
  };

  // Helper to generate the unique item name
  const calculateItemName = () => {
    const main = mainCategory.trim();
    const sub = subCategory.trim();
    if (!main) return '';
    let name = main;
    if (sub) {
      name += `-[${sub}]`;
    }
    attributes.forEach(attr => {
      const trimmed = attr.trim();
      if (trimmed) {
        name += `-[${trimmed}]`;
      }
    });
    return name;
  };

  const generatedItemName = calculateItemName();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.set('itemName', generatedItemName);
    
    // Convert undefined/null to empty string for API if needed, or rely on FormData ignoring them
    try {
      const res = await fetch(`/api/products/${initialData.id}`, {
        method: 'PATCH',
        body: formData,
      });
      
      if (res.ok) {
        router.push('/product-catalog');
        router.refresh();
      } else {
        alert('Failed to update product');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '16px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foreground)', fontSize: '1.5rem' }}>
          &larr;
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Edit Product: {initialData.itemCode}</h1>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Basic Information Block */}
        <div className="glass-card">
          <h3 style={{ borderBottom: '1px solid var(--input-border)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--primary)' }}>Basic Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div>
              <label className="label">Unique Item Code *</label>
              <input 
                required 
                type="text" 
                name="itemCode" 
                defaultValue={initialData.itemCode}
                className="input-field" 
                placeholder="e.g. CH-001" 
                onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()}
              />
            </div>
            <div>
              <label className="label">Item Name (Auto-Generated)</label>
              <input 
                type="text" 
                name="itemName" 
                value={generatedItemName} 
                readOnly 
                className="input-field" 
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed', opacity: 0.8 }} 
              />
            </div>
            <div>
              <label className="label">Main Category *</label>
              <input 
                required
                type="text"
                name="mainCategory" 
                value={mainCategory} 
                onChange={e => setMainCategory(e.target.value.toUpperCase())} 
                className="input-field" 
                placeholder="e.g. WORKSPACES"
              />
            </div>
            <div>
              <label className="label">Sub Category</label>
              <input 
                type="text" 
                name="subCategory" 
                value={subCategory} 
                onChange={e => setSubCategory(e.target.value)} 
                className="input-field" 
              />
            </div>
            <div>
              <label className="label">Material Category</label>
              <input type="text" name="materialCategory" defaultValue={initialData.materialCategory || ''} className="input-field" />
            </div>
            <div>
              <label className="label">Vendor Name</label>
              <input type="text" name="vendorName" defaultValue={initialData.vendorName || ''} className="input-field" />
            </div>
          </div>
        </div>
        
        {/* Dynamic Attributes Block */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--input-border)', paddingBottom: '12px', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>Product Attributes</h3>
            {attributes.length < 7 && (
              <button 
                type="button" 
                onClick={addAttribute} 
                className="btn-primary" 
                style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>+ Add Attribute</span>
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {attributes.map((attr, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Attribute {idx + 1}</span>
                  {attributes.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeAttribute(idx)} 
                      style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      Remove
                    </button>
                  )}
                </label>
                <input 
                  type="text" 
                  name={`attribute${idx + 1}`} 
                  value={attr} 
                  onChange={(e) => handleAttributeChange(idx, e.target.value)} 
                  className="input-field" 
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Unit Measurement Block */}
        <div className="glass-card">
          <h3 style={{ borderBottom: '1px solid var(--input-border)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--primary)' }}>Unit Measurement Metrics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div>
              <label className="label">Procure Unit</label>
              <input type="text" name="procureUnit" defaultValue={initialData.procureUnit || ''} className="input-field" />
            </div>
            <div>
              <label className="label">Costing Unit</label>
              <input type="text" name="costingUnit" defaultValue={initialData.costingUnit || ''} className="input-field" />
            </div>
            <div>
              <label className="label">Issue Unit</label>
              <input type="text" name="issueUnit" defaultValue={initialData.issueUnit || ''} className="input-field" />
            </div>
          </div>
        </div>

        {/* Financial & Unit Cost Block */}
        <div className="glass-card">
          <h3 style={{ borderBottom: '1px solid var(--input-border)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--primary)' }}>Financial & Unit Cost Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div>
              <label className="label">Procured Unit Cost (INR)</label>
              <input type="number" step="any" name="procuredUnitCost" defaultValue={initialData.procuredUnitCost || ''} className="input-field" />
            </div>
            <div>
              <label className="label">Costing Unit Cost (INR)</label>
              <input type="number" step="any" name="costingUnitCost" defaultValue={initialData.costingUnitCost || ''} className="input-field" />
            </div>
            <div>
              <label className="label">Issued Unit Cost (INR)</label>
              <input type="number" step="any" name="issuedUnitCost" defaultValue={initialData.issuedUnitCost || ''} className="input-field" />
            </div>
          </div>
        </div>

        {/* Stock & Storage Block */}
        <div className="glass-card">
          <h3 style={{ borderBottom: '1px solid var(--input-border)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--primary)' }}>Stock & Storage</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div>
              <label className="label">Opening Stock</label>
              <input type="number" step="any" name="openingStock" defaultValue={initialData.openingStock || ''} className="input-field" />
            </div>
            <div>
              <label className="label">Physical Stock</label>
              <input type="number" step="any" name="physicalStock" defaultValue={initialData.physicalStock || ''} className="input-field" />
            </div>
            <div>
              <label className="label">Re-Order Level</label>
              <input type="number" name="reOrderLevel" defaultValue={initialData.reOrderLevel || ''} className="input-field" />
            </div>
            <div>
              <label className="label">Storage Location</label>
              <input type="text" name="storageLocation" defaultValue={initialData.storageLocation || ''} className="input-field" />
            </div>
          </div>
        </div>

        {/* Verification Block */}
        <div className="glass-card">
          <h3 style={{ borderBottom: '1px solid var(--input-border)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--primary)' }}>Verification & Frequency</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div>
              <label className="label">Physical Stock Last Updated On</label>
              <input type="date" name="physicalStockLastUpdatedOn" defaultValue={initialData.physicalStockLastUpdatedOn ? new Date(initialData.physicalStockLastUpdatedOn).toISOString().split('T')[0] : ''} className="input-field" />
            </div>
            <div>
              <label className="label">Verification Frequency (Days)</label>
              <input type="number" name="verificationFrequency" defaultValue={initialData.verificationFrequency || ''} className="input-field" />
            </div>
          </div>
        </div>
        
        {/* Product Image Block */}
        <div className="glass-card">
          <h3 style={{ borderBottom: '1px solid var(--input-border)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--primary)' }}>Product Image</h3>
          <div>
            <label className="label">Upload New Image (Leave empty to keep current)</label>
            <div style={{ border: '2px dashed var(--input-border)', padding: '24px', borderRadius: '12px', textAlign: 'center', backgroundColor: 'var(--input-bg)' }}>
              <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="input-field" style={{ border: 'none', boxShadow: 'none', background: 'transparent' }} />
              {imagePreview && (
                <div style={{ marginTop: '20px' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'contain' }} />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ margin: '8px 0 32px 0', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '16px 48px', fontSize: '1.2rem', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)' }}>
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
