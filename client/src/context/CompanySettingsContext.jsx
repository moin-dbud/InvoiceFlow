import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

// ─── Context ──────────────────────────────────────────────────────────────────

const CompanySettingsContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CompanySettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        companyName: '',
        logoUrl: '',          // Cloudflare R2 / any CDN URL
        signatureUrl: '',     // Cloudflare R2 / any CDN URL
        address: '',
        contactNumber: '',
        gstin: '',
        loaded: false,        // true once initial fetch has completed
    });

    /**
     * Fetch fresh settings from the server and hydrate state + localStorage.
     */
    const fetchSettings = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setSettings(prev => ({ ...prev, loaded: true }));
            return;
        }
        try {
            const { data } = await axios.get(`${API}/auth/me`, authHeader());
            if (data.success) {
                const u = data.user;
                const next = {
                    companyName: u.showroomName || '',
                    logoUrl: u.dealerLogo || '',
                    signatureUrl: u.digitalSignature || '',
                    address: u.address || '',
                    contactNumber: u.contactNumber || '',
                    gstin: u.gstin || '',
                    loaded: true,
                };
                setSettings(next);
                // Persist compact snapshot used by DashboardLayout avatar
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({
                    ...stored,
                    showroomName: next.companyName,
                    dealerLogo: next.logoUrl,
                    gstin: next.gstin,
                    contactNumber: next.contactNumber,
                }));
            }
        } catch {
            setSettings(prev => ({ ...prev, loaded: true }));
        }
    }, []);

    /**
     * Instantly update local settings state (call after a successful API save).
     * Also syncs the compact localStorage snapshot and fires `userUpdated` so
     * DashboardLayout re-renders its avatar immediately.
     */
    const updateSettings = useCallback((patch) => {
        setSettings(prev => ({ ...prev, ...patch }));
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        const next = { ...stored };
        if (patch.companyName !== undefined) next.showroomName = patch.companyName;
        if (patch.logoUrl !== undefined)     next.dealerLogo    = patch.logoUrl;
        if (patch.gstin !== undefined)       next.gstin         = patch.gstin;
        if (patch.contactNumber !== undefined) next.contactNumber = patch.contactNumber;
        localStorage.setItem('user', JSON.stringify(next));
        window.dispatchEvent(new Event('userUpdated'));
    }, []);

    // Hydrate once on mount
    useEffect(() => {
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally omitting fetchSettings to run only once on mount

    // Re-hydrate whenever another component/page fires `userUpdated`
    useEffect(() => {
        const handler = () => { fetchSettings(); };
        window.addEventListener('userUpdated', handler);
        return () => window.removeEventListener('userUpdated', handler);
    }, [fetchSettings]);

    return (
        <CompanySettingsContext.Provider value={{ settings, updateSettings, fetchSettings }}>
            {children}
        </CompanySettingsContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Consume company-wide settings from anywhere in the component tree.
 *
 * @returns {{ settings: object, updateSettings: Function, fetchSettings: Function }}
 */
export function useCompanySettings() {
    const ctx = useContext(CompanySettingsContext);
    if (!ctx) {
        throw new Error('useCompanySettings must be used inside <CompanySettingsProvider>');
    }
    return ctx;
}
