import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    X, Plus, Trash2, Loader2, AlertCircle, User, Phone, MapPin,
    Package, Hash, IndianRupee, Percent, ToggleLeft, ToggleRight,
    CreditCard, Banknote, Smartphone, Building, FileCheck, Save, Eye
} from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

const paymentModes = [
    { value: 'cash', label: 'Cash', icon: <Banknote className="w-4 h-4" /> },
    { value: 'card', label: 'Card', icon: <CreditCard className="w-4 h-4" /> },
    { value: 'upi', label: 'UPI', icon: <Smartphone className="w-4 h-4" /> },
    { value: 'finance', label: 'Finance', icon: <Building className="w-4 h-4" /> },
    { value: 'cheque', label: 'Cheque', icon: <FileCheck className="w-4 h-4" /> },
];

const gstRates = [0, 5, 12, 18, 28];

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
    let result = convert(whole) + ' Rupees';
    if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
    return result + ' Only';
}

const emptyItem = { product: '', productName: '', quantity: 1, basePrice: 0, discountType: 'flat', discountValue: 0 };

export default function GenerateInvoiceModal({ onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [products, setProducts] = useState([]);

    // Customer
    const [customer, setCustomer] = useState({ name: '', mobile: '', address: '' });
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestRef = useRef(null);

    // Line Items
    const [lineItems, setLineItems] = useState([{ ...emptyItem }]);

    // GST
    const [gstEnabled, setGstEnabled] = useState(false);
    const [gstRate, setGstRate] = useState(18);

    // Payment
    const [paymentMode, setPaymentMode] = useState('cash');

    // Fetch products
    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await axios.get(`${API}/products?status=active`, authHeader());
                setProducts(data.products || []);
            } catch { }
        };
        fetch();
    }, []);

    // Customer auto-suggest
    const handleMobileChange = useCallback(async (value) => {
        setCustomer(prev => ({ ...prev, mobile: value }));
        if (value.length >= 3) {
            try {
                const { data } = await axios.get(`${API}/customers/suggest?mobile=${value}`, authHeader());
                setSuggestions(data.customers || []);
                setShowSuggestions(true);
            } catch { }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, []);

    const selectCustomer = (c) => {
        setCustomer({ name: c.name, mobile: c.mobile, address: c.address });
        setShowSuggestions(false);
    };

    // Line item handlers
    const updateItem = (idx, field, value) => {
        setLineItems(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value };

            if (field === 'product') {
                const prod = products.find(p => p._id === value);
                if (prod) {
                    updated[idx].productName = prod.name;
                    updated[idx].basePrice = prod.basePrice;
                }
            }
            return updated;
        });
    };

    const addItem = () => setLineItems(prev => [...prev, { ...emptyItem }]);
    const removeItem = (idx) => { if (lineItems.length > 1) setLineItems(prev => prev.filter((_, i) => i !== idx)); };

    // Calculations
    const calcLine = (item) => {
        const base = item.basePrice * item.quantity;
        const disc = item.discountType === 'percentage' ? (base * item.discountValue) / 100 : (item.discountValue || 0);
        return { discountAmount: Math.round(disc * 100) / 100, lineTotal: Math.round((base - disc) * 100) / 100 };
    };

    const subTotal = lineItems.reduce((s, item) => s + calcLine(item).lineTotal, 0);
    const totalDiscount = lineItems.reduce((s, item) => s + calcLine(item).discountAmount, 0);
    const rate = gstEnabled ? gstRate : 0;
    const cgst = Math.round((subTotal * rate) / 200 * 100) / 100;
    const sgst = cgst;
    const totalGst = cgst + sgst;
    const grandTotal = Math.round((subTotal + totalGst) * 100) / 100;

    const handleSubmit = async (status) => {
        if (!customer.name || !customer.mobile) { setError('Customer name and mobile are required'); return; }
        if (lineItems.some(i => !i.productName || i.quantity < 1)) { setError('Please fill all line items'); return; }

        setLoading(true);
        setError('');
        try {
            const payload = {
                customerName: customer.name,
                customerMobile: customer.mobile,
                customerAddress: customer.address,
                lineItems: lineItems.map(i => ({
                    product: i.product || undefined,
                    productName: i.productName,
                    quantity: Number(i.quantity),
                    basePrice: Number(i.basePrice),
                    discountType: i.discountType,
                    discountValue: Number(i.discountValue) || 0,
                })),
                gstEnabled, gstRate: rate, paymentMode, status,
            };
            const { data } = await axios.post(`${API}/invoices`, payload, authHeader());
            onSuccess(data.invoice);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create invoice');
        } finally { setLoading(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6 px-4"
            onClick={onClose}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                onClick={e => e.stopPropagation()}
                className="glass-card rounded-2xl w-full max-w-4xl my-auto relative">

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-0">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-white">Generate Invoice</h2>
                        <p className="text-sm text-gray-500">Fill in the details to create a new invoice</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left — Form sections */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Section 1: Customer */}
                        <div className="p-5 bg-white/[0.02] rounded-xl border border-white/5">
                            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><User className="w-4 h-4 text-indigo-400" /> Customer Details</h3>
                            <div className="space-y-3">
                                <div className="relative" ref={suggestRef}>
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input type="tel" placeholder="Customer Mobile" value={customer.mobile} maxLength={10}
                                        onChange={e => handleMobileChange(e.target.value)}
                                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-[#12121f] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                                            {suggestions.map(s => (
                                                <button key={s._id} onClick={() => selectCustomer(s)}
                                                    className="w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors">
                                                    <p className="text-sm text-white">{s.name}</p>
                                                    <p className="text-xs text-gray-500">{s.mobile}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                        <input type="text" placeholder="Customer Name" value={customer.name}
                                            onChange={e => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
                                    </div>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                        <input type="text" placeholder="Address" value={customer.address}
                                            onChange={e => setCustomer(prev => ({ ...prev, address: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Line Items */}
                        <div className="p-5 bg-white/[0.02] rounded-xl border border-white/5">
                            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-indigo-400" /> Line Items</h3>
                            <div className="space-y-3">
                                {lineItems.map((item, idx) => {
                                    const { discountAmount, lineTotal } = calcLine(item);
                                    return (
                                        <div key={idx} className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
                                            <div className="grid grid-cols-12 gap-2 items-end">
                                                {/* Product select */}
                                                <div className="col-span-12 sm:col-span-4">
                                                    <label className="text-[10px] text-gray-500 mb-1 block">Product</label>
                                                    <select value={item.product} onChange={e => updateItem(idx, 'product', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50 appearance-none">
                                                        <option value="" className="bg-[#0c0c18]">Select product</option>
                                                        {products.map(p => (
                                                            <option key={p._id} value={p._id} className="bg-[#0c0c18]">{p.name} (Stock: {p.stock})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {/* Qty */}
                                                <div className="col-span-4 sm:col-span-2">
                                                    <label className="text-[10px] text-gray-500 mb-1 block">Qty</label>
                                                    <input type="number" min="1" value={item.quantity}
                                                        onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                                                        className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50" />
                                                </div>
                                                {/* Price */}
                                                <div className="col-span-4 sm:col-span-2">
                                                    <label className="text-[10px] text-gray-500 mb-1 block">Price ₹</label>
                                                    <input type="number" value={item.basePrice} readOnly
                                                        className="w-full px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg text-gray-400 text-sm cursor-not-allowed" />
                                                </div>
                                                {/* Discount */}
                                                <div className="col-span-4 sm:col-span-3">
                                                    <label className="text-[10px] text-gray-500 mb-1 block">Discount</label>
                                                    <div className="flex">
                                                        <button type="button" onClick={() => updateItem(idx, 'discountType', item.discountType === 'flat' ? 'percentage' : 'flat')}
                                                            className="px-2 py-2 bg-white/[0.05] border border-white/10 border-r-0 rounded-l-lg text-xs text-gray-400 hover:text-white transition-colors flex-shrink-0">
                                                            {item.discountType === 'flat' ? '₹' : '%'}
                                                        </button>
                                                        <input type="number" min="0" value={item.discountValue}
                                                            onChange={e => updateItem(idx, 'discountValue', Number(e.target.value))}
                                                            className="w-full px-2 py-2 bg-white/[0.03] border border-white/10 rounded-r-lg text-white text-sm focus:outline-none focus:border-indigo-500/50" />
                                                    </div>
                                                </div>
                                                {/* Delete */}
                                                <div className="col-span-12 sm:col-span-1 flex items-end justify-between sm:justify-center">
                                                    <span className="sm:hidden text-sm text-white font-medium">Total: ₹{lineTotal.toLocaleString('en-IN')}</span>
                                                    <button type="button" onClick={() => removeItem(idx)} disabled={lineItems.length === 1}
                                                        className="p-2 text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="hidden sm:flex justify-end mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {discountAmount > 0 && <span className="text-red-400 mr-2">-₹{discountAmount.toLocaleString('en-IN')}</span>}
                                                    Line Total: <span className="text-white font-medium">₹{lineTotal.toLocaleString('en-IN')}</span>
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <button type="button" onClick={addItem}
                                    className="w-full py-2.5 border-2 border-dashed border-white/10 rounded-lg text-sm text-gray-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Line Item
                                </button>
                            </div>
                        </div>

                        {/* Section 3: GST Toggle */}
                        <div className="p-5 bg-white/[0.02] rounded-xl border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2"><IndianRupee className="w-4 h-4 text-indigo-400" /> GST</h3>
                                <button type="button" onClick={() => setGstEnabled(!gstEnabled)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${gstEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
                                    {gstEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                    {gstEnabled ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            {gstEnabled && (
                                <div className="flex flex-wrap gap-2">
                                    {gstRates.map(r => (
                                        <button key={r} type="button" onClick={() => setGstRate(r)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${gstRate === r ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-white/[0.03] text-gray-500 border border-white/10 hover:text-white'
                                                }`}>
                                            {r}%
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section 4: Payment Mode */}
                        <div className="p-5 bg-white/[0.02] rounded-xl border border-white/5">
                            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-indigo-400" /> Payment Mode</h3>
                            <div className="flex flex-wrap gap-2">
                                {paymentModes.map(pm => (
                                    <button key={pm.value} type="button" onClick={() => setPaymentMode(pm.value)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${paymentMode === pm.value ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-white/[0.03] text-gray-500 border border-white/10 hover:text-white'
                                            }`}>
                                        {pm.icon} {pm.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right — Live Summary */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-6 space-y-4">
                            <div className="p-5 bg-white/[0.02] rounded-xl border border-white/5">
                                <h3 className="text-sm font-semibold text-white mb-4">Invoice Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Sub-total</span><span className="text-white">₹{subTotal.toLocaleString('en-IN')}</span></div>
                                    {totalDiscount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="text-red-400">-₹{totalDiscount.toLocaleString('en-IN')}</span></div>}
                                    {gstEnabled && rate > 0 && (
                                        <>
                                            <div className="flex justify-between text-sm"><span className="text-gray-500">CGST ({rate / 2}%)</span><span className="text-white">₹{cgst.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between text-sm"><span className="text-gray-500">SGST ({rate / 2}%)</span><span className="text-white">₹{sgst.toLocaleString('en-IN')}</span></div>
                                        </>
                                    )}
                                    <div className="pt-3 border-t border-white/10">
                                        <div className="flex justify-between"><span className="text-sm font-bold text-white">Grand Total</span><span className="text-lg font-display font-bold text-indigo-400">₹{grandTotal.toLocaleString('en-IN')}</span></div>
                                    </div>
                                </div>
                            </div>

                            {grandTotal > 0 && (
                                <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                                    <p className="text-[11px] text-gray-500 mb-1">In Words</p>
                                    <p className="text-xs text-indigo-300 leading-relaxed">{numberToWords(grandTotal)}</p>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                    <p className="text-xs text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={loading}
                                    onClick={() => handleSubmit('generated')}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-60">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><FileCheck className="w-4 h-4" /> Generate Invoice</>}
                                </motion.button>
                                <button type="button" onClick={() => handleSubmit('draft')} disabled={loading}
                                    className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                    <Save className="w-4 h-4" /> Save Draft
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
