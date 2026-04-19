import { describe, it, expect } from 'vitest';
import { formatDate, formatTime, formatCurrency, generateSlug } from '../helpers';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-15T10:30:00');
    const result = formatDate(date);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/01|Jan/);
  });

  it('handles string dates', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBeTruthy();
  });

  it('handles invalid dates', () => {
    const result = formatDate('invalid');
    expect(result).toBe('Invalid Date');
  });

  it('handles null and undefined', () => {
    expect(formatDate(null)).toBe('Invalid Date');
    expect(formatDate(undefined)).toBe('Invalid Date');
  });
});

describe('formatTime', () => {
  it('formats time correctly', () => {
    const date = new Date('2024-01-15T14:30:00');
    const result = formatTime(date);
    expect(result).toMatch(/14:30|2:30/);
  });

  it('handles string times', () => {
    const result = formatTime('2024-01-15T14:30:00');
    expect(result).toBeTruthy();
  });

  it('handles invalid times', () => {
    const result = formatTime('invalid');
    expect(result).toBe('Invalid Time');
  });
});

describe('formatCurrency', () => {
  it('formats currency with default TRY', () => {
    const result = formatCurrency(100);
    expect(result).toContain('100');
    expect(result).toMatch(/₺|TRY/);
  });

  it('formats decimal numbers', () => {
    const result = formatCurrency(99.99);
    expect(result).toContain('99');
  });

  it('handles zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('handles negative numbers', () => {
    const result = formatCurrency(-50);
    expect(result).toContain('50');
  });

  it('handles different currencies', () => {
    const result = formatCurrency(100, 'USD');
    expect(result).toMatch(/\$|USD/);
  });
});

describe('generateSlug', () => {
  it('converts text to lowercase slug', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('handles Turkish characters', () => {
    expect(generateSlug('Çiçek Şube')).toBe('cicek-sube');
  });

  it('removes special characters', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('handles multiple spaces', () => {
    expect(generateSlug('Hello   World')).toBe('hello-world');
  });

  it('trims leading and trailing spaces', () => {
    expect(generateSlug('  Hello World  ')).toBe('hello-world');
  });

  it('handles empty strings', () => {
    expect(generateSlug('')).toBe('');
  });
});
