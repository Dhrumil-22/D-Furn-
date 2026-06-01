'use client';

import { useState } from 'react';

type Category = {
  id: number;
  name: string;
  image: string | null;
  isAvailable: boolean;
  type: string;
  parentName: string | null;
};

export default function CategoryManagement({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [isSubForm, setIsSubForm] = useState(false);
  const [parentName, setParentName] = useState('');

  const toggleAvailability = async (id: number, currentSync: boolean) => {
    setCategories(categories.map(c => c.id === id ? { ...c, isAvailable: !currentSync } : c));
    try {
      await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentSync })
      });
    } catch (e) {
      console.error(e);
      setCategories(categories.map(c => c.id === id ? { ...c, isAvailable: currentSync } : c));
    }
  };

  const [pendingDelete, setPendingDelete] = useState<{ id: number, timeoutId: NodeJS.Timeout, category: Category } | null>(null);

  const handleDelete = (id: number) => {
    // If there is already a pending delete, execute it immediately
    if (pendingDelete && pendingDelete.id !== id) {
      clearTimeout(pendingDelete.timeoutId);
      fetch(`/api/categories/${pendingDelete.id}`, { method: 'DELETE' }).catch(console.error);
    }

    const catToDelete = categories.find(c => c.id === id);
    if (!catToDelete) return;

    // Optimistically remove
    setCategories(categories.filter(c => c.id !== id));

    const timeoutId = setTimeout(async () => {
      try {
        await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error(e);
      }
      setPendingDelete(current => current?.id === id ? null : current);
    }, 5000);

    setPendingDelete({ id, timeoutId, category: catToDelete });
  };

  const handleUndoDelete = () => {
    if (pendingDelete) {
      clearTimeout(pendingDelete.timeoutId);
      setCategories([...categories, pendingDelete.category]);
      setPendingDelete(null);
    }
  };

  const openAddMainModal = () => {
    setEditingCat(null);
    setName('');
    setImage('');
    setIsSubForm(false);
    setParentName('');
    setIsModalOpen(true);
  };

  const openAddSubModal = () => {
    setEditingCat(null);
    setName('');
    setImage('');
    setIsSubForm(true);
    setParentName('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setImage(cat.image || '');
    setIsSubForm(cat.type === 'SUB');
    setParentName(cat.parentName || '');
    setIsModalOpen(true);
  };

  const [isManageMainModalOpen, setIsManageMainModalOpen] = useState(false);
  const [manageMainList, setManageMainList] = useState<{id?: number, name: string}[]>([]);

  const openManageMainModal = () => {
    setManageMainList(categories.filter(c => c.type === 'MASTER').map(c => ({ id: c.id, name: c.name })));
    setIsManageMainModalOpen(true);
  };

  const handleSaveBulkMains = async () => {
    const masterCategories = categories.filter(c => c.type === 'MASTER');
    const existingMasterIds = masterCategories.map(c => c.id);
    const currentIds = manageMainList.filter(m => m.id).map(m => m.id as number);
    
    const toDelete = existingMasterIds.filter(id => !currentIds.includes(id));
    const toUpdate = manageMainList.filter(m => m.id);
    const toCreate = manageMainList.filter(m => !m.id && m.name.trim() !== '');

    try {
      const deletePromises = toDelete.map(id => fetch(`/api/categories/${id}`, { method: 'DELETE' }));
      const updatePromises = toUpdate.map(item => fetch(`/api/categories/${item.id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name: item.name })
      }));
      const createPromises = toCreate.map(item => fetch(`/api/categories`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name: item.name, isAvailable: true, type: 'MASTER' })
      }));

      await Promise.all([...deletePromises, ...updatePromises, ...createPromises]);
      
      const res = await fetch('/api/categories');
      if (res.ok) {
         const data = await res.json();
         setCategories(data);
         setIsManageMainModalOpen(false);
      }
    } catch(e) {
      console.error(e);
      alert('Failed to save bulk changes');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        // Update
        const res = await fetch(`/api/categories/${editingCat.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, image, type: editingCat.type, parentName: editingCat.parentName })
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(categories.map(c => c.id === editingCat.id ? data.category : c));
          setIsModalOpen(false);
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to update');
        }
      } else {
        // Create
        if (isSubForm && !parentName) {
          alert('Please select a Main Category');
          return;
        }
        const payload = {
          name,
          image,
          isAvailable: true,
          type: isSubForm ? 'SUB' : 'MASTER',
          parentName: isSubForm ? parentName : null
        };
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          setCategories([...categories, data.category]);
          setIsModalOpen(false);
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to create');
        }
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    }
  };

  const masterCategories = categories.filter(c => c.type === 'MASTER');
  const tableCategories = categories.filter(c => c.type === 'SUB');

  return (
    <div>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Categories</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => window.open('/live-store', '_blank')}
            style={{ padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span style={{ fontSize: '1.1rem' }}>🌐</span> View Live Demo Store ↗
          </button>
          <button 
            onClick={openManageMainModal}
            style={{ padding: '10px 16px', backgroundColor: 'transparent', color: '#4747c2', border: '1px solid #4747c2', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>⛆</span> Main Categories
          </button>
          <button 
            onClick={openAddSubModal}
            style={{ padding: '10px 20px', backgroundColor: '#4747c2', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>+</span> Add Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#4755c2', color: 'white' }}>
              <th style={{ padding: '16px', width: '60px', textAlign: 'center' }}>#</th>
              <th style={{ padding: '16px', width: '120px' }}>Image</th>
              <th style={{ padding: '16px' }}>Category Name</th>
              <th style={{ padding: '16px', width: '150px', textAlign: 'center' }}>Availability</th>
              <th style={{ padding: '16px', width: '120px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tableCategories.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No categories found. Click a button above to create one.</td>
              </tr>
            ) : (
              tableCategories.map((cat, idx) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontWeight: 500 }}>{idx + 1}</td>
                  <td style={{ padding: '16px' }}>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                    ) : (
                      <div style={{ width: '80px', height: '50px', backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#64748b' }}>No Image</div>
                    )}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#334155' }}>
                    {cat.name}
                    {cat.type === 'SUB' && (
                      <span style={{ marginLeft: '12px', fontSize: '0.75rem', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', color: '#475569', fontWeight: 500 }}>
                        Sub of: {cat.parentName}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {/* Toggle Switch */}
                    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                      <div style={{ position: 'relative', width: '44px', height: '24px', backgroundColor: cat.isAvailable ? '#ec4899' : '#cbd5e1', borderRadius: '12px', transition: 'background-color 0.2s' }}>
                        <div style={{ position: 'absolute', top: '2px', left: cat.isAvailable ? '22px' : '2px', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transition: 'left 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
                      </div>
                      <input 
                        type="checkbox" 
                        checked={cat.isAvailable} 
                        onChange={() => toggleAvailability(cat.id, cat.isAvailable)}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => openEditModal(cat)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: '#eab308', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✏️</button>
                      <button onClick={() => handleDelete(cat.id)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: '#ef4444', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '400px', backgroundColor: 'white' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 700 }}>
              {editingCat ? 'Edit Category' : (isSubForm ? 'Add Sub Category' : 'Add Main Category')}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {isSubForm && (
                <div>
                  <label className="label">Select Main Category *</label>
                  <select 
                    required 
                    value={parentName} 
                    onChange={e => setParentName(e.target.value)} 
                    className="input-field" 
                    disabled={!!editingCat} // Don't let them change parent during edit for simplicity
                  >
                    <option value="">-- Choose Main Category --</option>
                    {masterCategories.map(mc => (
                      <option key={mc.id} value={mc.name}>{mc.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="label">{isSubForm ? 'Sub Category Name *' : 'Main Category Name *'}</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value.toUpperCase())} className="input-field" placeholder={isSubForm ? "e.g. WOODEN" : "e.g. WORKSPACES"} />
              </div>
              
              <div>
                <label className="label">Category Image</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input 
                    type="url" 
                    value={image} 
                    onChange={e => setImage(e.target.value)} 
                    className="input-field" 
                    placeholder="Paste Image URL here..." 
                  />
                  <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', margin: '4px 0' }}>OR</div>
                  <div style={{ border: '1px dashed #cbd5e1', padding: '12px', borderRadius: '6px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ fontSize: '0.9rem' }}
                    />
                  </div>
                  {image && (
                    <div style={{ marginTop: '8px', textAlign: 'center' }}>
                      <img src={image} alt="Preview" style={{ maxHeight: '100px', borderRadius: '6px', objectFit: 'contain', border: '1px solid #e2e8f0' }} />
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', border: 'none', backgroundColor: '#4747c2', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Manage Main Categories */}
      {isManageMainModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '500px', backgroundColor: 'white', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#334155' }}>Manage Main Categories</h3>
              <button 
                type="button"
                onClick={() => setManageMainList([...manageMainList, { name: '' }])}
                style={{ padding: '6px 12px', border: '1px solid #3b82f6', color: '#3b82f6', backgroundColor: 'transparent', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}
              >
                <span>+</span> Add Category
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              {manageMainList.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ flexGrow: 1, position: 'relative' }}>
                    <fieldset style={{ border: '1px solid #3b82f6', borderRadius: '4px', padding: '0 12px', margin: 0, position: 'relative' }}>
                       <legend style={{ fontSize: '0.75rem', color: '#64748b', padding: '0 4px' }}>Category Name*</legend>
                       <input 
                         type="text" 
                         value={item.name} 
                         onChange={e => {
                           const newList = [...manageMainList];
                           newList[index].name = e.target.value.toUpperCase();
                           setManageMainList(newList);
                         }}
                         style={{ width: '100%', border: 'none', outline: 'none', padding: '4px 0 12px 0', fontSize: '1rem', backgroundColor: 'transparent', color: '#334155', fontWeight: 500 }}
                       />
                    </fieldset>
                  </div>
                  <button 
                    onClick={() => {
                      const newList = [...manageMainList];
                      newList.splice(index, 1);
                      setManageMainList(newList);
                    }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))}
              {manageMainList.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No categories found. Click "+ Add Category" to create one.</div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
               <button onClick={() => setIsManageMainModalOpen(false)} style={{ padding: '10px 16px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
               <button onClick={handleSaveBulkMains} style={{ padding: '10px 16px', border: 'none', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Delete Toast */}
      {pendingDelete && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', zIndex: 9999 }}>
          <span style={{ fontWeight: 500 }}>Category deleted.</span>
          <button 
            onClick={handleUndoDelete}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#38bdf8', fontWeight: 700, cursor: 'pointer', padding: '4px 8px', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
