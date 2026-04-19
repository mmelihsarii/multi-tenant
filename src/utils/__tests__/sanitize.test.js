import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeHTML } from '../sanitize';

describe('sanitizeInput', () => {
  it('removes HTML tags from input', () => {
    const input = '<script>alert("xss")</script>Hello';
    expect(sanitizeInput(input)).toBe('Hello');
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('  Hello World  ')).toBe('Hello World');
  });

  it('handles empty strings', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('handles null and undefined', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
  });

  it('removes dangerous characters', () => {
    const input = 'Hello<>World';
    const result = sanitizeInput(input);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('preserves safe text', () => {
    const input = 'Hello World 123';
    expect(sanitizeInput(input)).toBe('Hello World 123');
  });
});

describe('sanitizeHTML', () => {
  it('allows safe HTML tags', () => {
    const html = '<p>Hello <strong>World</strong></p>';
    const result = sanitizeHTML(html);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });

  it('removes script tags', () => {
    const html = '<p>Hello</p><script>alert("xss")</script>';
    const result = sanitizeHTML(html);
    expect(result).not.toContain('<script>');
    expect(result).toContain('<p>Hello</p>');
  });

  it('removes event handlers', () => {
    const html = '<div onclick="alert(\'xss\')">Click me</div>';
    const result = sanitizeHTML(html);
    expect(result).not.toContain('onclick');
  });

  it('removes javascript: URLs', () => {
    const html = '<a href="javascript:alert(\'xss\')">Link</a>';
    const result = sanitizeHTML(html);
    expect(result).not.toContain('javascript:');
  });

  it('handles empty strings', () => {
    expect(sanitizeHTML('')).toBe('');
  });

  it('preserves safe attributes', () => {
    const html = '<a href="https://example.com" target="_blank">Link</a>';
    const result = sanitizeHTML(html);
    expect(result).toContain('href="https://example.com"');
  });
});
