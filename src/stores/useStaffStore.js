import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { handleError } from '../utils/errorHandler';

const useStaffStore = create((set, get) => ({
  // State
  staff: [],
  loading: false,
  lastFetch: null,
  cacheTimeout: 5 * 60 * 1000, // 5 dakika cache

  // Actions
  fetchStaff: async (companyId, forceRefresh = false) => {
    const { lastFetch, cacheTimeout, staff } = get();
    const now = Date.now();

    // Cache kontrolü
    if (!forceRefresh && lastFetch && now - lastFetch < cacheTimeout && staff.length > 0) {
      return staff;
    }

    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', companyId)
        .eq('role', 'staff')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({
        staff: data || [],
        loading: false,
        lastFetch: now,
      });

      return data || [];
    } catch (error) {
      set({ loading: false });
      handleError(error, 'fetchStaff', 'Personel listesi yüklenirken hata oluştu');
      throw error;
    }
  },

  addStaff: async (staffData) => {
    try {
      // Edge Function ile personel oluştur
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-staff`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify(staffData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Personel eklenirken hata oluştu');
      }

      const newStaff = await response.json();

      // Optimistic update
      set((state) => ({
        staff: [newStaff, ...state.staff],
      }));

      return newStaff;
    } catch (error) {
      handleError(error, 'addStaff', 'Personel eklenirken hata oluştu');
      throw error;
    }
  },

  updateStaff: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Optimistic update
      set((state) => ({
        staff: state.staff.map((member) =>
          member.id === id ? { ...member, ...data } : member
        ),
      }));

      return data;
    } catch (error) {
      handleError(error, 'updateStaff', 'Personel güncellenirken hata oluştu');
      throw error;
    }
  },

  deleteStaff: async (staffId) => {
    try {
      // Edge Function ile hem auth hem de users tablosundan sil
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-staff`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ userId: staffId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Personel silinirken hata oluştu');
      }

      // Optimistic update
      set((state) => ({
        staff: state.staff.filter((member) => member.id !== staffId),
      }));
    } catch (error) {
      handleError(error, 'deleteStaff', 'Personel silinirken hata oluştu');
      throw error;
    }
  },

  toggleStaffStatus: async (id, currentStatus) => {
    const newStatus = !currentStatus;

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Optimistic update
      set((state) => ({
        staff: state.staff.map((member) =>
          member.id === id ? { ...member, is_active: newStatus } : member
        ),
      }));
    } catch (error) {
      handleError(error, 'toggleStaffStatus', 'Personel durumu değiştirilirken hata oluştu');
      throw error;
    }
  },

  clearCache: () => {
    set({ staff: [], lastFetch: null });
  },
}));

export default useStaffStore;
