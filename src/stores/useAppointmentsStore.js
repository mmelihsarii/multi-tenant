import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { handleError } from '../utils/errorHandler';

const useAppointmentsStore = create((set, get) => ({
  // State
  appointments: [],
  loading: false,
  lastFetch: null,
  cacheTimeout: 2 * 60 * 1000, // 2 dakika cache (randevular daha sık değişir)

  // Actions
  fetchAppointments: async (companyId, forceRefresh = false) => {
    const { lastFetch, cacheTimeout, appointments } = get();
    const now = Date.now();

    // Cache kontrolü
    if (!forceRefresh && lastFetch && now - lastFetch < cacheTimeout && appointments.length > 0) {
      return appointments;
    }

    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          *,
          service:services(name, duration, price),
          staff:users!appointments_staff_id_fkey(full_name)
        `
        )
        .eq('company_id', companyId)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      set({
        appointments: data || [],
        loading: false,
        lastFetch: now,
      });

      return data || [];
    } catch (error) {
      set({ loading: false });
      handleError(error, 'fetchAppointments', 'Randevular yüklenirken hata oluştu');
      throw error;
    }
  },

  addAppointment: async (appointmentData) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select(
          `
          *,
          service:services(name, duration, price),
          staff:users!appointments_staff_id_fkey(full_name)
        `
        )
        .single();

      if (error) throw error;

      // Optimistic update
      set((state) => ({
        appointments: [...state.appointments, data].sort((a, b) => {
          const dateCompare = new Date(a.appointment_date) - new Date(b.appointment_date);
          if (dateCompare !== 0) return dateCompare;
          return a.appointment_time.localeCompare(b.appointment_time);
        }),
      }));

      return data;
    } catch (error) {
      handleError(error, 'addAppointment', 'Randevu oluşturulurken hata oluştu');
      throw error;
    }
  },

  updateAppointment: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select(
          `
          *,
          service:services(name, duration, price),
          staff:users!appointments_staff_id_fkey(full_name)
        `
        )
        .single();

      if (error) throw error;

      // Optimistic update
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt.id === id ? { ...apt, ...data } : apt
        ),
      }));

      return data;
    } catch (error) {
      handleError(error, 'updateAppointment', 'Randevu güncellenirken hata oluştu');
      throw error;
    }
  },

  updateAppointmentStatus: async (id, status) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Optimistic update
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt.id === id ? { ...apt, status } : apt
        ),
      }));
    } catch (error) {
      handleError(error, 'updateAppointmentStatus', 'Randevu durumu güncellenirken hata oluştu');
      throw error;
    }
  },

  deleteAppointment: async (id) => {
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);

      if (error) throw error;

      // Optimistic update
      set((state) => ({
        appointments: state.appointments.filter((apt) => apt.id !== id),
      }));
    } catch (error) {
      handleError(error, 'deleteAppointment', 'Randevu silinirken hata oluştu');
      throw error;
    }
  },

  // Filtreleme helper'ları (computed values)
  getPendingAppointments: () => {
    return get().appointments.filter((apt) => apt.status === 'pending');
  },

  getConfirmedAppointments: () => {
    return get().appointments.filter((apt) => apt.status === 'confirmed');
  },

  getTodayAppointments: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().appointments.filter((apt) => apt.appointment_date === today);
  },

  clearCache: () => {
    set({ appointments: [], lastFetch: null });
  },
}));

export default useAppointmentsStore;
