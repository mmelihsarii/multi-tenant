import * as yup from 'yup';

// Login validation schema
export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Geçerli bir email adresi girin')
    .required('Email adresi zorunludur')
    .trim(),
  password: yup.string().min(6, 'Şifre en az 6 karakter olmalıdır').required('Şifre zorunludur'),
});

// Register validation schema
export const registerSchema = yup.object({
  fullName: yup
    .string()
    .min(2, 'Ad Soyad en az 2 karakter olmalıdır')
    .max(100, 'Ad Soyad en fazla 100 karakter olabilir')
    .required('Ad Soyad zorunludur')
    .trim(),
  email: yup
    .string()
    .email('Geçerli bir email adresi girin')
    .required('Email adresi zorunludur')
    .trim(),
  password: yup
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
    )
    .required('Şifre zorunludur'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
  companyName: yup
    .string()
    .min(2, 'İşletme adı en az 2 karakter olmalıdır')
    .max(100, 'İşletme adı en fazla 100 karakter olabilir')
    .required('İşletme adı zorunludur')
    .trim(),
  phoneNumber: yup
    .string()
    .matches(
      /^(\+90|0)?[5][0-9]{9}$/,
      'Geçerli bir Türkiye telefon numarası girin (örn: 05XX XXX XX XX)'
    )
    .required('Telefon numarası zorunludur'),
  address: yup.string().max(200, 'Adres en fazla 200 karakter olabilir'),
});

// Service validation schema
export const serviceSchema = yup.object({
  name: yup
    .string()
    .min(3, 'Hizmet adı en az 3 karakter olmalıdır')
    .max(100, 'Hizmet adı en fazla 100 karakter olabilir')
    .required('Hizmet adı zorunludur')
    .trim(),
  duration: yup
    .number()
    .min(15, 'Süre en az 15 dakika olmalıdır')
    .max(480, 'Süre en fazla 8 saat (480 dakika) olabilir')
    .required('Süre zorunludur')
    .typeError('Süre sayı olmalıdır'),
  price: yup
    .number()
    .min(0, 'Fiyat negatif olamaz')
    .max(999999, 'Fiyat çok yüksek')
    .required('Fiyat zorunludur')
    .typeError('Fiyat sayı olmalıdır'),
  description: yup.string().max(500, 'Açıklama en fazla 500 karakter olabilir').trim(),
});

// Staff validation schema
export const staffSchema = yup.object({
  fullName: yup
    .string()
    .min(2, 'Ad Soyad en az 2 karakter olmalıdır')
    .max(100, 'Ad Soyad en fazla 100 karakter olabilir')
    .required('Ad Soyad zorunludur')
    .trim(),
  email: yup
    .string()
    .email('Geçerli bir email adresi girin')
    .required('Email adresi zorunludur')
    .trim(),
  password: yup
    .string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .when('$isEditing', {
      is: false,
      then: (schema) => schema.required('Şifre zorunludur'),
      otherwise: (schema) => schema.notRequired(),
    }),
  phone: yup
    .string()
    .nullable()
    .notRequired()
    .matches(/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir Türkiye telefon numarası girin'),
});

// Appointment validation schema
export const appointmentSchema = yup.object({
  customer_name: yup
    .string()
    .min(2, 'Müşteri adı en az 2 karakter olmalıdır')
    .max(100, 'Müşteri adı en fazla 100 karakter olabilir')
    .required('Müşteri adı zorunludur')
    .trim(),
  customer_phone: yup
    .string()
    .matches(/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir Türkiye telefon numarası girin')
    .required('Telefon numarası zorunludur'),
  customer_email: yup.string().email('Geçerli bir email adresi girin').trim(),
  appt_date: yup.string().required('Randevu tarihi zorunludur'),
  appt_time: yup
    .string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat girin (örn: 14:30)')
    .required('Randevu saati zorunludur'),
  service_id: yup.string().required('Hizmet seçimi zorunludur'),
  staff_id: yup.string().required('Personel seçimi zorunludur'),
  notes: yup.string().max(500, 'Notlar en fazla 500 karakter olabilir'),
});

// Public Booking validation schema
export const publicBookingSchema = yup.object({
  customer_name: yup
    .string()
    .min(2, 'Müşteri adı en az 2 karakter olmalıdır')
    .max(100, 'Müşteri adı en fazla 100 karakter olabilir')
    .required('Müşteri adı zorunludur')
    .trim(),
  customer_phone: yup
    .string()
    .matches(/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir Türkiye telefon numarası girin')
    .required('Telefon numarası zorunludur'),
  customer_email: yup.string().email('Geçerli bir email adresi girin').trim(),
  appt_date: yup.string().required('Randevu tarihi zorunludur'),
  appt_time: yup
    .string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat girin (örn: 14:30)')
    .required('Randevu saati zorunludur'),
});

// Helper function: Telefon numarası formatla
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Sadece rakamları al
  const cleaned = phone.replace(/\D/g, '');
  // 0 ile başlıyorsa kaldır
  const withoutZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  // Format: 5XX XXX XX XX
  if (withoutZero.length === 10) {
    return `${withoutZero.slice(0, 3)} ${withoutZero.slice(3, 6)} ${withoutZero.slice(6, 8)} ${withoutZero.slice(8)}`;
  }
  return phone;
};

// Helper function: Email benzersizlik kontrolü
export const checkEmailExists = async (supabase, email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single();

    return !!data && !error;
  } catch (error) {
    return false;
  }
};

// Helper function: İşletme adı benzersizlik kontrolü
export const checkBusinessNameExists = async (supabase, businessName) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('name')
      .ilike('name', businessName.trim())
      .single();

    return !!data && !error;
  } catch (error) {
    return false;
  }
};
