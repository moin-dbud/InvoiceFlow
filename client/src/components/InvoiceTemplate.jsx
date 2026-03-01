import { forwardRef } from 'react';

// Number to words (Indian system)
function numberToWords(num) {
    if (num === 0) return 'Zero';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const convert = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };
    const whole = Math.floor(num);
    const paise = Math.round((num - whole) * 100);
    let result = 'Rupees ' + convert(whole);
    if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
    return result + ' Only';
}

const fmt = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const InvoiceTemplate = forwardRef(({ invoice, dealer }, ref) => {
    const date = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });

    const paymentLabels = {
        cash: 'Cash', card: 'Card', upi: 'Online Transfer/UPI',
        finance: 'Finance', cheque: 'Cheque',
    };

    return (
        <div ref={ref} style={{
            width: '794px', minHeight: '1123px', background: '#ffffff', color: '#1a1a1a',
            fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", fontSize: '13px',
            lineHeight: '1.5', padding: '40px 50px', boxSizing: 'border-box',
            position: 'relative',
        }}>

            {/* ===== HEADER with logos ===== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                {/* LEFT: Bhoomi Logo + Text */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/assets/bhoomi-logo.png" alt="Bhoomi"
                        style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                    <div>
                        <p style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#3d3530', letterSpacing: '0.5px' }}>Bhoomi Automobiles</p>
                        <p style={{ fontSize: '10px', fontWeight: '500', margin: '2px 0 0', color: '#888', letterSpacing: '2px', textTransform: 'uppercase' }}>Drive Electric</p>
                    </div>
                </div>

                {/* RIGHT: Dealer's registered logo */}
                <div style={{ width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {dealer?.dealerLogo ? (
                        <img src={dealer.dealerLogo} alt="Dealer Logo"
                            style={{ maxWidth: '90px', maxHeight: '90px', objectFit: 'contain', borderRadius: '8px' }} />
                    ) : (
                        <div style={{
                            width: '70px', height: '70px', borderRadius: '14px',
                            background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '24px', fontWeight: '800'
                        }}>
                            {dealer?.showroomName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'DS'}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== TAX INVOICE HEADING ===== */}
            <div style={{ textAlign: 'center', margin: '15px 0 20px', borderBottom: '2px solid #1a1a1a', paddingBottom: '15px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '2px', margin: 0, color: '#1a1a1a' }}>
                    TAX INVOICE
                </h1>
            </div>

            {/* ===== DEALER & INVOICE DETAILS ===== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #e5e5e5', paddingBottom: '18px' }}>
                {/* Dealer Details */}
                <div style={{ flex: 1, maxWidth: '55%' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px', color: '#1a1a1a' }}>Dealer Details:</h3>
                    <p style={{ fontSize: '15px', fontWeight: '700', margin: '2px 0' }}>{dealer?.showroomName || 'Dealer Showroom'}</p>
                    <p style={{ margin: '2px 0', color: '#555', fontSize: '12px' }}>Authorised Dealer: Bhoomi Motors</p>
                    <p style={{ margin: '2px 0', color: '#444' }}>
                        <strong>Address:</strong> {dealer?.address || 'N/A'}
                    </p>
                    <p style={{ margin: '2px 0', color: '#444' }}>
                        <strong>Mobile:</strong> +91 {dealer?.contactNumber || 'N/A'}
                    </p>
                    <p style={{ margin: '2px 0', color: '#444' }}>
                        <strong>GSTIN:</strong> {dealer?.gstin || 'N/A'}
                    </p>
                </div>

                {/* Invoice Details */}
                <div style={{ textAlign: 'left', minWidth: '35%' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px', color: '#1a1a1a' }}>Invoice Details</h3>
                    <p style={{ margin: '2px 0', color: '#444' }}>
                        <strong>Invoice No:</strong> {invoice.invoiceNumber}
                    </p>
                    <p style={{ margin: '2px 0', color: '#444' }}>
                        <strong>Date:</strong> {date}
                    </p>
                    <p style={{ margin: '2px 0', color: '#444' }}>
                        <strong>Status:</strong>{' '}
                        <span style={{
                            background: invoice.status === 'generated' ? '#dcfce7' : invoice.status === 'cancelled' ? '#fef2f2' : '#f3f4f6',
                            color: invoice.status === 'generated' ? '#16a34a' : invoice.status === 'cancelled' ? '#dc2626' : '#6b7280',
                            padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase'
                        }}>
                            {invoice.status}
                        </span>
                    </p>
                </div>
            </div>

            {/* ===== BILL TO ===== */}
            <div style={{ marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #e5e5e5' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px', color: '#1a1a1a' }}>Bill To</h3>
                <p style={{ fontSize: '15px', fontWeight: '700', margin: '2px 0' }}>
                    Customer Name: {invoice.customerName}
                </p>
                {invoice.customerAddress && (
                    <p style={{ margin: '2px 0', color: '#444' }}>Address: {invoice.customerAddress}</p>
                )}
                <p style={{ margin: '2px 0', color: '#444' }}>Mobile: +91 {invoice.customerMobile}</p>
            </div>

            {/* ===== ITEMS TABLE ===== */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0', fontSize: '12px' }}>
                <thead>
                    <tr style={{ background: '#1a1a1a', color: '#ffffff' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', width: '40px', border: '1px solid #333' }}>Sr.</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '700', border: '1px solid #333' }}>Product</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', width: '50px', border: '1px solid #333' }}>Qty</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', width: '100px', border: '1px solid #333' }}>Base Price</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', width: '90px', border: '1px solid #333' }}>Discount</th>
                        {invoice.gstEnabled && <>
                            <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', width: '60px', border: '1px solid #333' }}>GST%</th>
                            <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', width: '90px', border: '1px solid #333' }}>GST Amt</th>
                        </>}
                        <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', width: '100px', border: '1px solid #333' }}>Line Total</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.lineItems.map((item, i) => {
                        const gstPerItem = invoice.gstEnabled ? (item.lineTotal * invoice.gstRate) / 100 : 0;
                        return (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#fafafa' : '#ffffff' }}>
                                <td style={{ padding: '10px 12px', textAlign: 'center', border: '1px solid #e5e5e5' }}>{i + 1}</td>
                                <td style={{ padding: '10px 12px', fontWeight: '500', border: '1px solid #e5e5e5' }}>{item.productName}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'center', border: '1px solid #e5e5e5' }}>{item.quantity}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'right', border: '1px solid #e5e5e5' }}>{fmt(item.basePrice)}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'right', border: '1px solid #e5e5e5', color: item.discountAmount > 0 ? '#dc2626' : '#888' }}>
                                    {item.discountAmount > 0 ? fmt(item.discountAmount) : '—'}
                                </td>
                                {invoice.gstEnabled && <>
                                    <td style={{ padding: '10px 12px', textAlign: 'center', border: '1px solid #e5e5e5' }}>{invoice.gstRate}%</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', border: '1px solid #e5e5e5' }}>{fmt(gstPerItem)}</td>
                                </>}
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', border: '1px solid #e5e5e5' }}>{fmt(item.lineTotal)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* ===== SUMMARY TABLE (aligned right) ===== */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0' }}>
                <table style={{ borderCollapse: 'collapse', minWidth: '300px', fontSize: '12px' }}>
                    <tbody>
                        {/* GST breakdown */}
                        {invoice.gstEnabled && invoice.gstRate > 0 && (
                            <>
                                <tr>
                                    <td style={{ padding: '8px 14px', background: '#f5f5f5', fontWeight: '600', border: '1px solid #e5e5e5' }}>CGST ({invoice.gstRate / 2}%)</td>
                                    <td style={{ padding: '8px 14px', textAlign: 'right', background: '#f5f5f5', border: '1px solid #e5e5e5' }}>{fmt(invoice.cgst)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 14px', background: '#f5f5f5', fontWeight: '600', border: '1px solid #e5e5e5' }}>SGST ({invoice.gstRate / 2}%)</td>
                                    <td style={{ padding: '8px 14px', textAlign: 'right', background: '#f5f5f5', border: '1px solid #e5e5e5' }}>{fmt(invoice.sgst)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 14px', background: '#f5f5f5', fontWeight: '600', border: '1px solid #e5e5e5' }}>Total GST</td>
                                    <td style={{ padding: '8px 14px', textAlign: 'right', background: '#f5f5f5', fontWeight: '600', border: '1px solid #e5e5e5' }}>{fmt(invoice.totalGst)}</td>
                                </tr>
                            </>
                        )}
                        <tr>
                            <td style={{ padding: '8px 14px', background: '#333', color: '#fff', fontWeight: '700', border: '1px solid #333' }}>Sub-total</td>
                            <td style={{ padding: '8px 14px', textAlign: 'right', background: '#333', color: '#fff', fontWeight: '600', border: '1px solid #333' }}>{fmt(invoice.subTotal)}</td>
                        </tr>
                        {invoice.totalDiscount > 0 && (
                            <tr>
                                <td style={{ padding: '8px 14px', background: '#333', color: '#fff', fontWeight: '700', border: '1px solid #333' }}>Total Discount</td>
                                <td style={{ padding: '8px 14px', textAlign: 'right', background: '#333', color: '#ff6b6b', fontWeight: '600', border: '1px solid #333' }}>-{fmt(invoice.totalDiscount)}</td>
                            </tr>
                        )}
                        <tr>
                            <td style={{ padding: '10px 14px', background: '#1a1a1a', color: '#fff', fontWeight: '800', fontSize: '14px', border: '1px solid #1a1a1a' }}>GRAND TOTAL</td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', background: '#1a1a1a', color: '#fff', fontWeight: '800', fontSize: '14px', border: '1px solid #1a1a1a' }}>₹{fmt(invoice.grandTotal)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ===== GRAND TOTAL IN WORDS + PAYMENT ===== */}
            <div style={{ marginTop: '24px', marginBottom: '30px' }}>
                <p style={{ margin: '4px 0', fontSize: '13px' }}>
                    <strong>Grand Total (in words): </strong>
                    <span style={{ color: '#333' }}>{numberToWords(invoice.grandTotal)}</span>
                </p>
                <p style={{ margin: '4px 0', fontSize: '13px' }}>
                    <strong>Payment Mode: </strong>{paymentLabels[invoice.paymentMode] || invoice.paymentMode}
                </p>
            </div>

            {/* ===== FOOTER ===== */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                borderTop: '2px solid #1a1a1a', paddingTop: '20px', marginTop: 'auto',
            }}>
                {/* Left: Bhoomi branding */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/assets/bhoomi-logo.png" alt="Bhoomi"
                        style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                    <div>
                        <p style={{ fontWeight: '700', fontSize: '13px', margin: 0, color: '#3d3530' }}>
                            <span style={{ color: '#3d3530' }}>Bhoomi Motors:</span>{' '}
                            <span style={{ fontWeight: '400', color: '#666' }}>Powering the Future of Mobility</span>
                        </p>
                        <p style={{ fontSize: '11px', color: '#888', margin: '2px 0 0' }}>Powered by InvoiceFlow</p>
                    </div>
                </div>

                {/* Right: Signature */}
                <div style={{ textAlign: 'center' }}>
                    {dealer?.digitalSignature ? (
                        <img src={dealer.digitalSignature} alt="Signature"
                            style={{ width: '200px', height: '100px', objectFit: 'contain', marginBottom: '6px' }} />
                    ) : (
                        <div style={{ width: '160px', height: '60px', borderBottom: '1px solid #ccc', marginBottom: '6px' }} />
                    )}
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#444', margin: 0 }}>Authorised Signatory</p>
                </div>
            </div>

            {/* Decorative bottom line */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)' }} />
        </div>
    );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';
export default InvoiceTemplate;
