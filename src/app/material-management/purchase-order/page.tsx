'use client';

import { useState } from 'react';
import Link from 'next/link';

type POItem = {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
};

export default function PurchaseOrderGenerator() {
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

      <div className="no-print" style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '16px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Purchase Order Generator</h1>
      </div>

      <div className="po-grid-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>

        {/* Left Side: Form */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingRight: '16px' }}>

          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', color: 'var(--primary)', borderBottom: '1px solid var(--input-border)', paddingBottom: '8px' }}>Vendor & PO Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">PO Number</label>
                <input type="text" value={poNumber} onChange={e => setPoNumber(e.target.value)} className="input-field" placeholder="e.g. PO-2026-001" />
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="input-field" />
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
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'end', backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--input-border)' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            </div>
          </div>

          {/* Print Button at bottom of form */}
          <div className="no-print" style={{ marginTop: '24px' }}>
            <button onClick={handlePrint} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.2rem', borderRadius: '8px', fontWeight: 'bold' }}>
              <i className="fi fi-rr-print" style={{ fontSize: '1.1rem' }}></i> Download / Print PDF
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
                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{item.unit}</td>
                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{item.rate.toFixed(2)}</td>
                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{(item.quantity * item.rate).toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={5} style={{ border: '1px solid black', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Total Amount:</td>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{totalAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={5} style={{ border: '1px solid black', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>GST ({gstPercentage}%):</td>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{gstAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={5} style={{ border: '1px solid black', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Freight Charges:</td>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{freight.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={5} style={{ border: '1px solid black', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Net Payable:</td>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{netPayable.toFixed(2)}</td>
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
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 'bold' }}>Department Head</div>
                <div style={{ fontWeight: 'bold' }}>Authorised Signature</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
