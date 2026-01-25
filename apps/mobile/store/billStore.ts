import { create } from 'zustand';
import { Bill } from '../types/models';
import { mockApi } from '../services/mockApi';

interface BillState {
    bills: Bill[];
    loading: boolean;
    error: string | null;

    fetchBills: (filters?: any) => Promise<void>;
    getBillById: (id: string) => Bill | undefined;
    addBill: (bill: Partial<Bill>) => void;
    updateBill: (id: string, updates: Partial<Bill>) => void;
    deleteBill: (id: string) => void;
    markAsPaid: (id: string) => void;
}

export const useBillStore = create<BillState>((set, get) => ({
    bills: [],
    loading: false,
    error: null,

    fetchBills: async (filters) => {
        set({ loading: true, error: null });
        try {
            const bills = await mockApi.getBills(filters) as Bill[];
            set({ bills, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch bills', loading: false });
        }
    },

    getBillById: (id) => {
        return get().bills.find(b => b.id === id);
    },

    addBill: (bill) => {
        const newBill = {
            id: `bill-${Date.now()}`,
            userId: 'user-1',
            isDraft: false,
            paymentStatus: 'unpaid',
            createdAt: new Date().toISOString(),
            ...bill,
        } as Bill;

        set(state => ({ bills: [...state.bills, newBill] }));
    },

    updateBill: (id, updates) => {
        set(state => ({
            bills: state.bills.map(b =>
                b.id === id ? { ...b, ...updates } : b
            ),
        }));
    },

    deleteBill: (id) => {
        set(state => ({ bills: state.bills.filter(b => b.id !== id) }));
    },

    markAsPaid: (id) => {
        set(state => ({
            bills: state.bills.map(b =>
                b.id === id ? { ...b, paymentStatus: 'paid' as const } : b
            ),
        }));
    },
}));
