import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge } from '../badge'; // Adjust path as needed

describe('Badge Component', () => {
  it('renders default variant correctly', () => {
    render(<Badge>Default Badge</Badge>);
    const badgeElement = screen.getByText('Default Badge');
    expect(badgeElement).toBeInTheDocument();
    // Default variant usually includes primary background color
    expect(badgeElement).toHaveClass('bg-primary'); 
    expect(badgeElement).toHaveClass('text-primary-foreground');
  });

  it('renders secondary variant correctly', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);
    const badgeElement = screen.getByText('Secondary Badge');
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveClass('bg-secondary');
    expect(badgeElement).toHaveClass('text-secondary-foreground');
  });

  it('renders destructive variant correctly', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);
    const badgeElement = screen.getByText('Destructive Badge');
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveClass('bg-destructive');
    expect(badgeElement).toHaveClass('text-destructive-foreground');
  });

  it('renders outline variant correctly', () => {
    render(<Badge variant="outline">Outline Badge</Badge>);
    const badgeElement = screen.getByText('Outline Badge');
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveClass('text-foreground');
    expect(badgeElement).not.toHaveClass('bg-primary'); // Should not have default background
  });

  it('applies additional className', () => {
    render(<Badge className="extra-class">Classy Badge</Badge>);
    const badgeElement = screen.getByText('Classy Badge');
    expect(badgeElement).toHaveClass('extra-class');
  });
}); 