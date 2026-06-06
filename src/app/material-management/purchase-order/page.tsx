'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { removeBackground } from '@imgly/background-removal';
import CustomDropdown from '@/components/CustomDropdown';

type POItem = {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
};

export default function PurchaseOrderGenerator() {
  const router = useRouter();
  const [poId, setPoId] = useState<number | null>(null);

  const [vendorName, setVendorName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  const [items, setItems] = useState<POItem[]>([
    { id: '1', code: '', name: '', quantity: 1, unit: 'Nos', rate: 0 }
  ]);

  const [gstPercentage, setGstPercentage] = useState<number>(18);
  const [freight, setFreight] = useState<number>(0);

  const [modeOfDispatch, setModeOfDispatch] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [signaturePosition, setSignaturePosition] = useState<'department_head' | 'authorised_signature'>('authorised_signature');
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [useAiBgRemoval, setUseAiBgRemoval] = useState(false); // Default to false (instant mode)
  const [bgStatus, setBgStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // Load PO if ID is in URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setPoId(parseInt(id));
      fetch(`/api/purchase-orders/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setVendorName(data.vendorName || '');
            setAddress1(data.address1 || '');
            setAddress2(data.address2 || '');
            setPoNumber(data.poNumber || '');
            setPurchaseDate(data.purchaseDate || '');
            setGstPercentage(data.gstPercentage || 18);
            setFreight(data.freight || 0);
            setModeOfDispatch(data.modeOfDispatch || '');
            setDeliveryTerms(data.deliveryTerms || '');
            setPaymentTerms(data.paymentTerms || '');
            setPreparedBy(data.preparedBy || '');
            if (data.signatureImage) setSignatureImage(data.signatureImage);
            if (data.signaturePosition) setSignaturePosition(data.signaturePosition);
            
            if (data.items && data.items.length > 0) {
              setItems(data.items.map((it: any) => ({
                id: it.id.toString(),
                code: it.code,
                name: it.name,
                quantity: it.quantity,
                unit: it.unit,
                rate: it.rate
              })));
            }
            if (data.logs) {
              setLogs(data.logs);
            }
          }
        });
    }
  }, []);

  const handleDateChange = async (newDate: string) => {
    setPurchaseDate(newDate);
    // Auto-generate PO Number when user changes date
    if (newDate) {
      try {
        const res = await fetch(`/api/purchase-orders/next-sequence?date=${newDate}`);
        const data = await res.json();
        if (data.generatedId) {
          setPoNumber(data.generatedId);
        }
      } catch (error) {
        console.error('Failed to fetch next PO sequence:', error);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const payload = {
      vendorName, address1, address2, poNumber, purchaseDate,
      gstPercentage, freight, modeOfDispatch, deliveryTerms,
      paymentTerms, preparedBy, signatureImage, signaturePosition,
      items
    };

    try {
      if (poId) {
        await fetch(`/api/purchase-orders/${poId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setShowSuccessModal(true);
      } else {
        const res = await fetch('/api/purchase-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        setPoId(data.id);
        window.history.replaceState(null, '', `?id=${data.id}`);
        setShowSuccessModal(true);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save Purchase Order.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!useAiBgRemoval) {
      // INSTANT MODE: No AI processing
      const resultUrl = URL.createObjectURL(file);
      setSignatureImage(resultUrl);
      return;
    }

    try {
      setIsRemovingBg(true);
      setBgStatus('Initializing AI Model...');

      const resultBlob = await removeBackground(file, {
        model: 'small', // Use small model for drastically faster performance
        progress: (key, current, total) => {
          const percentage = Math.round((current / total) * 100);
          setBgStatus(`Processing (${percentage}%)`);
        }
      });

      const resultUrl = URL.createObjectURL(resultBlob);
      setSignatureImage(resultUrl);
    } catch (error) {
      console.error("Background removal failed:", error);
      alert("Failed to remove background. Please try another image.");
    } finally {
      setIsRemovingBg(false);
      setBgStatus('');
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), code: '', name: '', quantity: 1, unit: 'Nos', rate: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    if (newItems.length === 0) {
      newItems.push({ id: Date.now().toString(), code: '', name: '', quantity: 1, unit: 'Nos', rate: 0 });
    }
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof POItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Calculations
  const totalAmount = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const gstAmount = totalAmount * (gstPercentage / 100);
  const netPayable = totalAmount + gstAmount + freight;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container" style={{ maxWidth: '100%' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          /* Hide sidebar and Next.js wrappers */
          aside { display: none !important; }
          .no-print { display: none !important; }

          /* Reset layout containers so they don't clip content or add extra height */
          html, body, .layout-container, .main-content, .page-container, .po-grid-container {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Force the preview to exactly fill one borderless page without spilling on Letter/A4 */
          #po-preview {
            width: 100% !important;
            height: 285mm !important;
            min-height: 288mm !important;
            max-height: 288mm !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: auto;
            margin: 0; /* Remove browser margins completely */
          }
          /* Force table borders to print */
          table, th, td {
            border-collapse: collapse !important;
          }
          th {
            background-color: #f1f5f9 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />

      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '2rem' }}>
        <button onClick={() => router.back()} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--card-bg)', color: 'var(--text-color)', border: '1px solid var(--input-border)' }}>
          <i className="fi fi-rr-arrow-left"></i> Back
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
          Purchase Order {poId ? `(Editing #${poNumber || poId})` : 'Generator'}
        </h1>
      </div>

      <div className="po-grid-container responsive-grid-2" style={{ alignItems: 'start' }}>

        {/* Left Side: Form */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingRight: '16px' }}>

          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', color: 'var(--primary)', borderBottom: '1px solid var(--input-border)', paddingBottom: '8px' }}>Vendor & PO Details</h3>
            <div className="responsive-grid-2">
              <div>
                <label className="label">PO Number</label>
                <input type="text" value={poNumber} onChange={e => setPoNumber(e.target.value)} className="input-field" placeholder="e.g. PO-2026-001" />
              </div>
              <div>
                <label className="label">Date <span style={{color: '#ef4444'}}>*</span></label>
                <input type="date" className="input-field" value={purchaseDate} onChange={e => handleDateChange(e.target.value)} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Vendor Name</label>
                <input type="text" value={vendorName} onChange={e => setVendorName(e.target.value)} className="input-field" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Address Line 1</label>
                <input type="text" value={address1} onChange={e => setAddress1(e.target.value)} className="input-field" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Address Line 2</label>
                <input type="text" value={address2} onChange={e => setAddress2(e.target.value)} className="input-field" />
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--input-border)', paddingBottom: '8px' }}>
              <h3 style={{ color: 'var(--primary)', margin: 0 }}>Materials</h3>
              <button onClick={addItem} className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.85rem' }}>+ Add Item</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item, index) => (
                <div key={item.id} className="item-grid" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--input-border)' }}>
                  <div>
                    <label className="label" style={{ fontSize: '0.75rem' }}>Code</label>
                    <input type="text" value={item.code} onChange={e => updateItem(index, 'code', e.target.value)} className="input-field" style={{ padding: '6px' }} />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '0.75rem' }}>Material Name</label>
                    <input type="text" value={item.name} onChange={e => updateItem(index, 'name', e.target.value)} className="input-field" style={{ padding: '6px' }} />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '0.75rem' }}>Qty</label>
                    <input type="number" value={item.quantity || ''} onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value))} className="input-field" style={{ padding: '6px' }} />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '0.75rem' }}>Unit</label>
                    <input type="text" value={item.unit} onChange={e => updateItem(index, 'unit', e.target.value)} className="input-field" style={{ padding: '6px' }} />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '0.75rem' }}>Rate</label>
                    <input type="number" value={item.rate || ''} onChange={e => updateItem(index, 'rate', parseFloat(e.target.value))} className="input-field" style={{ padding: '6px' }} />
                  </div>
                  <button onClick={() => removeItem(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', fontSize: '1.2rem' }}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', color: 'var(--primary)', borderBottom: '1px solid var(--input-border)', paddingBottom: '8px' }}>Totals & Taxes</h3>
            <div className="responsive-grid-2">
              <div>
                <label className="label">GST Percentage (%)</label>
                <input type="number" value={gstPercentage} onChange={e => setGstPercentage(parseFloat(e.target.value) || 0)} className="input-field" />
              </div>
              <div>
                <label className="label">Freight Charges (₹)</label>
                <input type="number" value={freight || ''} onChange={e => setFreight(parseFloat(e.target.value) || 0)} className="input-field" />
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', color: 'var(--primary)', borderBottom: '1px solid var(--input-border)', paddingBottom: '8px' }}>Terms & Info</h3>
            <div className="responsive-grid-2">
              <div>
                <label className="label">Mode of Dispatch</label>
                <input type="text" value={modeOfDispatch} onChange={e => setModeOfDispatch(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Prepared By</label>
                <input type="text" value={preparedBy} onChange={e => setPreparedBy(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Delivery Terms (Days)</label>
                <input type="text" value={deliveryTerms} onChange={e => setDeliveryTerms(e.target.value)} className="input-field" placeholder="e.g. 7" />
              </div>
              <div>
                <label className="label">Payment Terms (Days)</label>
                <input type="text" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="input-field" placeholder="e.g. 30" />
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--input-border)', paddingTop: '16px', marginTop: '8px' }}>
                <h4 style={{ marginBottom: '12px', color: 'var(--primary)', fontSize: '0.9rem' }}>Signature Configuration</h4>
                <div className="responsive-grid-2">
                  <div>
                    <label className="label">Upload Signature Image</label>
                    <input type="file" accept="image/*" onChange={handleSignatureUpload} disabled={isRemovingBg} className="input-field" style={{ padding: '8px', marginBottom: '8px' }} />
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        type="checkbox" 
                        id="useAiBgRemoval" 
                        checked={useAiBgRemoval} 
                        onChange={(e) => setUseAiBgRemoval(e.target.checked)} 
                        style={{ cursor: 'pointer' }}
                      />
                      <label htmlFor="useAiBgRemoval" style={{ fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' }}>
                        Enable AI Background Removal (Slower)
                      </label>
                    </div>

                    {isRemovingBg && (
                      <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--brand-orange)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', animation: 'pulse 1.5s infinite ease-in-out' }}>
                        <i className="fi fi-rr-spinner" style={{ animation: 'spin 1s linear infinite' }}></i>
                        {bgStatus}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="label">Signature Position</label>
                    <CustomDropdown
                      value={signaturePosition}
                      onChange={(val: string) => setSignaturePosition(val as any)}
                      options={[
                        { label: 'Department Head', value: 'department_head' },
                        { label: 'Authorised Signature', value: 'authorised_signature' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="no-print" style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
            <button onClick={handleSave} disabled={isSaving} className="btn-primary" style={{ flex: 1, padding: '16px', fontSize: '1.1rem', borderRadius: '8px', fontWeight: 'bold' }}>
              {isSaving ? 'Saving...' : (poId ? 'Update PO Draft' : 'Save PO Draft')}
            </button>
            <button onClick={handlePrint} className="btn-primary" style={{ flex: 1, padding: '16px', fontSize: '1.1rem', borderRadius: '8px', fontWeight: 'bold' }}>
              <i className="fi fi-rr-print" style={{ fontSize: '1.1rem' }}></i> Download / Print
            </button>
          </div>
        </div>


        {/* Right Side: Live HTML Replica */}
        <div style={{ backgroundColor: '#e2e8f0', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>

          <div id="po-preview" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white', width: '210mm', minHeight: '297mm', padding: '40px', color: 'black', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontSize: '13px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ color: '#f97316', margin: 0, fontSize: '36px', fontWeight: '900' }}>d'furn</h1>
              <h2 style={{ color: 'black', margin: '4px 0 0 0', fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Purchase Order</h2>
            </div>

            {/* Top Details Grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid black', padding: '16px', marginBottom: '24px' }}>
              {/* Left Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: '1.5' }}>
                <div><strong>&#9742; :</strong> +91- 7069031690</div>
                <div><strong>GSTIN :</strong> 24AADCD4139R1ZB</div>
                <div><strong>&#9993; :</strong> purchase@dfurn.in</div>
                <div style={{ marginTop: '12px', fontWeight: '800', fontSize: '15px', textTransform: 'uppercase' }}>Vendor Details</div>
                <div style={{ fontWeight: '600' }}>{vendorName || '<<Vendor Name>>'}</div>
                <div>{address1 || '<<Address Line 1>>'}</div>
                <div>{address2 || '<<Address Line 2>>'}</div>
              </div>

              {/* Right Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '900', fontSize: '15px' }}>DFurn Modular System Pvt.Ltd.</div>
                <div>Survey No. 670,677,678 And 679,</div>
                <div>Village Traj,Taluka: Matar,</div>
                <div>District: Kheda,</div>
                <div>Gujarat-387530.</div>
                <div style={{ marginTop: '12px', fontWeight: '800' }}>PO Number : <span style={{ fontWeight: '500' }}>{poNumber || '<<PO Number>>'}</span></div>
                <div style={{ fontWeight: '800' }}>Date : <span style={{ fontWeight: '500' }}>{purchaseDate || '<<Purchase Date>>'}</span></div>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '32px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid black', padding: '10px 8px', backgroundColor: '#e2e8f0', textAlign: 'center', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase' }}>Material Code</th>
                  <th style={{ border: '1px solid black', padding: '10px 8px', backgroundColor: '#e2e8f0', textAlign: 'center', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase' }}>Material Name</th>
                  <th style={{ border: '1px solid black', padding: '10px 8px', backgroundColor: '#e2e8f0', textAlign: 'center', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase' }}>Quantity</th>
                  <th style={{ border: '1px solid black', padding: '10px 8px', backgroundColor: '#e2e8f0', textAlign: 'center', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase' }}>Unit</th>
                  <th style={{ border: '1px solid black', padding: '10px 8px', backgroundColor: '#e2e8f0', textAlign: 'center', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase' }}>Rate</th>
                  <th style={{ border: '1px solid black', padding: '10px 8px', backgroundColor: '#e2e8f0', textAlign: 'center', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{item.code}</td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{item.name}</td>
                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{isNaN(item.quantity) ? '' : item.quantity}</td>
                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{item.unit}</td>
                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{isNaN(item.rate) ? '0.00' : item.rate.toFixed(2)}</td>
                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{isNaN(item.quantity * item.rate) ? '0.00' : (item.quantity * item.rate).toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={5} style={{ border: '1px solid black', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{isNaN(totalAmount) ? '0.00' : totalAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={5} style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>Add: GST @ {gstPercentage}%</td>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{isNaN(gstAmount) ? '0.00' : gstAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={5} style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>Add: Freight / Handling</td>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{isNaN(freight) ? '0.00' : freight.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={5} style={{ border: '1px solid black', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Net Payable</td>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{isNaN(netPayable) ? '0.00' : netPayable.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Footer Boxes */}
            <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid black', minHeight: '150px' }}>
              <div style={{ borderRight: '1px solid black', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Mode of Dispatch :</strong> {modeOfDispatch}</div>
                <div><strong>Delivery Terms :</strong> {deliveryTerms} Days</div>
                <div><strong>Payment Terms :</strong> {paymentTerms} Days</div>
                <div style={{ marginTop: '16px' }}><strong>Prepared By :</strong> {preparedBy}</div>

                <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '10px' }}>
                  *No Deliveries will be accepted after 5:00 PM<br />
                  *Mention the PO Number in your delivery challan and Invoice
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

                {/* Department Head Box */}
                <div style={{ padding: '16px', borderRight: '1px solid black', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
                  {signatureImage && signaturePosition === 'department_head' && (
                    <img
                      src={signatureImage}
                      alt="Signature"
                      style={{ position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)', width: '240px', height: '120px', objectFit: 'contain' }}
                    />
                  )}
                  <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Department Head</div>
                </div>

                {/* Authorised Signature Box */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
                  {signatureImage && signaturePosition === 'authorised_signature' && (
                    <img
                      src={signatureImage}
                      alt="Signature"
                      style={{ position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)', width: '240px', height: '120px', objectFit: 'contain' }}
                    />
                  )}
                  <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Authorised Signature</div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div className="glass-card" style={{ 
            padding: '40px', maxWidth: '400px', width: '90%', textAlign: 'center',
            animation: 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
          }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px auto', fontSize: '2.5rem',
              animation: 'bounceIn 0.6s cubic-bezier(0.280, 0.840, 0.420, 1) 0.2s both'
            }}>
              ✓
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Success!</h3>
            <p style={{ opacity: 0.8, marginBottom: '32px' }}>
              The Purchase Order has been successfully saved.
            </p>
            <button onClick={() => {
              setShowSuccessModal(false);
              router.push('/material-management/purchase-order/history');
            }} className="btn-primary" style={{ padding: '12px 32px', width: '100%' }}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}} />
    </div>
  );
}
