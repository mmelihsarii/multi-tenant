import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { handleError } from '../utils/errorHandler';

const useServicesStore = create((set, get) => ({
  // State
  services: [],
  loading: false,
  lastFetch: null,
  cacheTimeout: 5 * 60 * 1000, // 5 dakika cache

  // Actions
  fetchServices: async (companyId, forceRefresh = false) => {
    const { lastFetch, cacheTimeout, services } = get();
    const now = Date.now();

    // Cache kontrolü - force refresh yoksa ve cache geçerliyse
    if (!forceRefresh && lastFetch && now - lastFetch < cacheTimeout && services.length > 0) {
      return services; // Cache'den dön
    }

    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({
        services: data || [],
        loading: false,
        lastFetch: now,
      });

      return data || [];
    } catch (error) {
      set({ loading: false });
      handleError(error, 'fetchServices', 'Hizmetler yüklenirken hata oluştu');
      throw error;
    }
  },

  addService: async (serviceData) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select()
        .single();

      if (error) throw error;

      // Optimistic update
      set((state) => ({
        services: [data, ...state.services],
      }));

      return data;
    } catch (error) {
      handleError(error, 'addService', 'Hizmet eklenirken hata oluştu');
      throw error;
    }
  },

  updateService: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Optimistic update
      set((state) => ({
        services: state.services.map((service) =>
          service.id === id ? { ...service, ...data } : service
        ),
      }));

      return data;
    } catch (error) {
      handleError(error, 'updateService', 'Hizmet güncellenirken hata oluştu');
      throw error;
    }
  },

  deleteService: async (id) => {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);

      if (error) throw error;

      // Optimistic update
      set((state) => ({
        services: state.services.filter((service) => service.id !== id),
      }));
    } catch (error) {
      handleError(error, 'deleteService', 'Hizmet silinirken hata oluştu');
      throw error;
    }
  },

  toggleServiceStatus: async (id, currentStatus) => {
    const newStatus = !currentStatus;

    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Optimistic update
      set((state) => ({
        services: state.services.map((service) =>
          service.id === id ? { ...service, is_active: newStatus } : service
        ),
      }));
    } catch (error) {
      handleError(error, 'toggleServiceStatus', 'Hizmet durumu değiştirilirken hata oluştu');
      throw error;
    }
  },

  // Cache'i temizle
  clearCache: () => {
    set({ services: [], lastFetch: null });
  },
}));

export default useServicesStore;
