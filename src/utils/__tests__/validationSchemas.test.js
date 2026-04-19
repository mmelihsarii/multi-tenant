import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  serviceSchema,
  staffSchema,
  appointmentSchema,
} from '../validationSchemas';

describe('loginSchema', () => {
  it('validates correct login data', async () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    };
    
    await expect(loginSchema.validate(validData)).resolves.toEqual(validData);
  });

  it('rejects invalid email', async () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
    };
    
    await expect(loginSchema.validate(invalidData)).rejects.toThrow();
  });

  it('rejects empty password', async () => {
    const invalidData = {
      email: 'test@example.com',
      password: '',
    };
    
    await expect(loginSchema.validate(invalidData)).rejects.toThrow();
  });

  it('requires email field', async () => {
    const invalidData = {
      password: 'password123',
    };
    
    await expect(loginSchema.validate(invalidData)).rejects.toThrow();
  });
});

describe('registerSchema', () => {
  it('validates correct registration data', async () => {
    const validData = {
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      companyName: 'Test Business',
      fullName: 'John Doe',
      phoneNumber: '05551234567',
    };
    
    await expect(registerSchema.validate(validData)).resolves.toBeDefined();
  });

  it('rejects mismatched passwords', async () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'DifferentPassword123',
      companyName: 'Test Business',
      fullName: 'John Doe',
      phoneNumber: '05551234567',
    };
    
    await expect(registerSchema.validate(invalidData)).rejects.toThrow();
  });

  it('rejects weak passwords', async () => {
    const invalidData = {
      email: 'test@example.com',
      password: '123',
      confirmPassword: '123',
      companyName: 'Test Business',
      fullName: 'John Doe',
      phoneNumber: '05551234567',
    };
    
    await expect(registerSchema.validate(invalidData)).rejects.toThrow();
  });

  it('requires business name', async () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      fullName: 'John Doe',
      phoneNumber: '05551234567',
    };
    
    await expect(registerSchema.validate(invalidData)).rejects.toThrow();
  });
});

describe('serviceSchema', () => {
  it('validates correct service data', async () => {
    const validData = {
      name: 'Haircut',
      description: 'Professional haircut service',
      duration: 30,
      price: 100,
    };
    
    await expect(serviceSchema.validate(validData)).resolves.toBeDefined();
  });

  it('rejects negative duration', async () => {
    const invalidData = {
      name: 'Haircut',
      duration: -30,
      price: 100,
    };
    
    await expect(serviceSchema.validate(invalidData)).rejects.toThrow();
  });

  it('rejects negative price', async () => {
    const invalidData = {
      name: 'Haircut',
      duration: 30,
      price: -100,
    };
    
    await expect(serviceSchema.validate(invalidData)).rejects.toThrow();
  });

  it('requires service name', async () => {
    const invalidData = {
      duration: 30,
      price: 100,
    };
    
    await expect(serviceSchema.validate(invalidData)).rejects.toThrow();
  });

  it('accepts zero price for free services', async () => {
    const validData = {
      name: 'Consultation',
      duration: 15,
      price: 0,
    };
    
    await expect(serviceSchema.validate(validData)).resolves.toBeDefined();
  });
});

describe('staffSchema', () => {
  it('validates correct staff data', async () => {
    const validData = {
      email: 'staff@example.com',
      fullName: 'Jane Smith',
      password: 'Pass123',
    };
    
    await expect(staffSchema.validate(validData)).resolves.toBeDefined();
  });

  it('rejects invalid email', async () => {
    const invalidData = {
      email: 'invalid-email',
      fullName: 'Jane Smith',
      password: 'Pass123',
    };
    
    await expect(staffSchema.validate(invalidData)).rejects.toThrow();
  });

  it('requires full name', async () => {
    const invalidData = {
      email: 'staff@example.com',
      password: 'Pass123',
    };
    
    await expect(staffSchema.validate(invalidData)).rejects.toThrow();
  });

  it('validates with phone', async () => {
    const validData = {
      email: 'staff@example.com',
      fullName: 'Jane Smith',
      password: 'Pass123',
      phone: '05551234567',
    };
    
    await expect(staffSchema.validate(validData)).resolves.toBeDefined();
  });
});

describe('appointmentSchema', () => {
  it('validates correct appointment data', async () => {
    const validData = {
      service_id: '123e4567-e89b-12d3-a456-426614174000',
      staff_id: '123e4567-e89b-12d3-a456-426614174001',
      appt_date: '2024-12-31',
      appt_time: '14:30',
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      customer_phone: '+905551234567',
    };
    
    await expect(appointmentSchema.validate(validData)).resolves.toBeDefined();
  });

  it('rejects invalid date format', async () => {
    const invalidData = {
      service_id: '123e4567-e89b-12d3-a456-426614174000',
      staff_id: '123e4567-e89b-12d3-a456-426614174001',
      appt_date: '', // Empty date
      appt_time: '14:30',
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      customer_phone: '05551234567',
    };
    
    await expect(appointmentSchema.validate(invalidData)).rejects.toThrow();
  });

  it('requires customer name', async () => {
    const invalidData = {
      service_id: '123e4567-e89b-12d3-a456-426614174000',
      staff_id: '123e4567-e89b-12d3-a456-426614174001',
      appt_date: '2024-12-31',
      appt_time: '14:30',
      customer_email: 'john@example.com',
      customer_phone: '05551234567',
    };
    
    await expect(appointmentSchema.validate(invalidData)).rejects.toThrow();
  });

  it('validates phone number format', async () => {
    const validData = {
      service_id: '123e4567-e89b-12d3-a456-426614174000',
      staff_id: '123e4567-e89b-12d3-a456-426614174001',
      appt_date: '2024-12-31',
      appt_time: '14:30',
      customer_name: 'John Doe',
      customer_phone: '05551234567',
    };
    
    await expect(appointmentSchema.validate(validData)).resolves.toBeDefined();
  });
});
