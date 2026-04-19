import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../Input';

describe('Input Component', () => {
  it('renders input with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument(); // Label olduğu gibi render ediliyor
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<Input label="Name" />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'John Doe');
    
    expect(input).toHaveValue('John Doe');
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('applies error styles when error prop is provided', () => {
    const { container } = render(<Input label="Email" error="Invalid email" />);
    const inputContainer = container.querySelector('div[class*="border-red-500"]');
    
    expect(inputContainer).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input label="Email" placeholder="Enter your email" />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  it('handles different input types', () => {
    const { rerender, container } = render(<Input label="Email" type="email" />);
    const emailInput = container.querySelector('input[type="email"]');
    expect(emailInput).toBeInTheDocument();

    rerender(<Input label="Password" type="password" />);
    const passwordInput = container.querySelector('input[type="password"]');
    expect(passwordInput).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<Input label="Email" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('calls onChange handler', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(<Input label="Name" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'A');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders with helper text', () => {
    render(<Input label="Email" helperText="We'll never share your email" />);
    expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Input label="Email" className="custom-input" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });
});
