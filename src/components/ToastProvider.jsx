import { Toaster } from 'react-hot-toast';

/**
 * Toast Notification Provider
 * Tüm uygulama genelinde toast mesajları gösterir
 */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Varsayılan ayarlar
        duration: 4000,
        style: {
          background: '#18181B', // zinc-900
          color: '#FAFAFA', // zinc-50
          borderRadius: '12px',
          padding: '16px 20px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
        },

        // Success toast
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10B981', // emerald-500
            secondary: '#FAFAFA',
          },
          style: {
            background: '#18181B',
            color: '#FAFAFA',
          },
        },

        // Error toast
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#EF4444', // red-500
            secondary: '#FAFAFA',
          },
          style: {
            background: '#18181B',
            color: '#FAFAFA',
          },
        },

        // Loading toast
        loading: {
          duration: Infinity,
          iconTheme: {
            primary: '#F43F5E', // rose-500
            secondary: '#FAFAFA',
          },
          style: {
            background: '#18181B',
            color: '#FAFAFA',
          },
        },

        // Custom toast
        custom: {
          duration: 4000,
        },
      }}
    />
  );
}

/**
 * Toast helper fonksiyonları
 * Kullanım: import { showSuccessToast } from '@/components/ToastProvider';
 */
import toast from 'react-hot-toast';

export const showSuccessToast = (message) => {
  toast.success(message);
};

export const showErrorToast = (message) => {
  toast.error(message);
};

export const showLoadingToast = (message) => {
  return toast.loading(message);
};

export const showInfoToast = (message) => {
  toast(message, {
    icon: 'ℹ️',
    style: {
      background: '#18181B',
      color: '#FAFAFA',
    },
  });
};

export const showWarningToast = (message) => {
  toast(message, {
    icon: '⚠️',
    style: {
      background: '#F59E0B', // amber-500
      color: '#FFFFFF',
    },
  });
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Promise-based toast
 * Async işlemler için kullanışlı
 */
export const showPromiseToast = (promise, messages) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'İşlem yapılıyor...',
      success: messages.success || 'İşlem başarılı!',
      error: messages.error || 'İşlem başarısız!',
    },
    {
      style: {
        background: '#18181B',
        color: '#FAFAFA',
      },
    }
  );
};
