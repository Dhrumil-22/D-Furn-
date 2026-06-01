'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Controlled category and attribute states for item name construction
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [attributes, setAttributes] = useState<string[]>(['']);
  
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbCategories(data);
      })
      .catch(console.error);
  }, []);

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

  // Helper to generate the unique item name: mainCategory-[subCategory]-[attribute1]-[attribute2]...
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
    // Explicitly set the calculated item name
    formData.set('itemName', generatedItemName);
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        router.push('/product-catalog');
        router.refresh();
      } else {
        alert('Failed to add product');
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
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Add New Product</h1>
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
                placeholder="e.g. chair-[wood]-[yellow]" 
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
                placeholder="e.g. wood" 
              />
            </div>
            <div>
              <label className="label">Material Category</label>
              <input type="text" name="materialCategory" className="input-field" placeholder="e.g. Wood, Metal" />
            </div>
            <div>
              <label className="label">Vendor Name</label>
              <input type="text" name="vendorName" className="input-field" placeholder="e.g. Jainam Office System" />
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
                  placeholder={`e.g. ${idx === 0 ? 'yellow' : 'value'}`} 
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
              <input type="text" name="procureUnit" className="input-field" placeholder="e.g. Nos, kg, mtr" />
            </div>
            <div>
              <label className="label">Costing Unit</label>
              <input type="text" name="costingUnit" className="input-field" placeholder="e.g. Nos, kg, mtr" />
            </div>
            <div>
              <label className="label">Issue Unit</label>
              <input type="text" name="issueUnit" className="input-field" placeholder="e.g. Nos, kg, mtr" />
            </div>
          </div>
        </div>

        {/* Financial & Unit Cost Block */}
        <div className="glass-card">
          <h3 style={{ borderBottom: '1px solid var(--input-border)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--primary)' }}>Financial & Unit Cost Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div>
              <label className="label">Procured Unit Cost (INR)</label>
              <input type="number" step="any" name="procuredUnitCost" className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="label">Costing Unit Cost (INR)</label>
              <input type="number" step="any" name="costingUnitCost" className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="label">Issued Unit Cost (INR)</label>
              <input type="number" step="any" name="issuedUnitCost" className="input-field" placeholder="0.00" />
            </div>
          </div>
        </div>

        {/* Stock & Storage Block */}
        <div className="glass-card">
          <h3 style={{ borderBottom: '1px solid var(--input-border)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--primary)' }}>Stock & Storage</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div>
              <label className="label">Opening Stock</label>
              <input type="number" step="any" name="openingStock" className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="label">Physical Stock</label>
              <input type="number" step="any" name="physicalStock" className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="label">Re-Order Level</label>
              <input type="number" name="reOrderLevel" className="input-field" placeholder="e.g. 10" />
            </div>
            <div>
              <label className="label">Storage Location</label>
              <input type="text" name="storageLocation" className="input-field" placeholder="e.g. Warehouse A" />
            </div>
          </div>
        </div>

        {/* Verification Block */}
        <div className="glass-card">
          <h3 style={{ borderBottom: '1px solid var(--input-border)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--primary)' }}>Verification & Frequency</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div>
              <label className="label">Physical Stock Last Updated On</label>
              <input type="date" name="physicalStockLastUpdatedOn" className="input-field" />
            </div>
            <div>
              <label className="label">Verification Frequency (Days)</label>
              <input type="number" name="verificationFrequency" className="input-field" placeholder="e.g. 30" />
            </div>
          </div>
        </div>
        
        {/* Product Image Block */}
        <div className="glass-card">
          <h3 style={{ borderBottom: '1px solid var(--input-border)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--primary)' }}>Product Image</h3>
          <div>
            <label className="label">Upload Image</label>
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
            {loading ? 'Saving Product...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
