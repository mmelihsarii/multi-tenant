import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '../Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    const card = container.firstChild;
    
    expect(card).toHaveClass('custom-card');
  });

  it('renders with padding by default', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    
    expect(card).toHaveClass('p-6');
  });

  it('renders without padding when noPadding is true', () => {
    const { container } = render(<Card noPadding>Content</Card>);
    const card = container.firstChild;
    
    expect(card).not.toHaveClass('p-6');
  });
});
