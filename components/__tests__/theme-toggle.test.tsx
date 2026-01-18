import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../theme-toggle';
import { ThemeProvider } from '@/lib/contexts/theme-context';

// Mock the theme context
const mockSetTheme = vi.fn();

vi.mock('@/lib/contexts/theme-context', async () => {
  const actual = await vi.importActual('@/lib/contexts/theme-context');
  return {
    ...actual,
    useTheme: vi.fn(),
  };
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with light theme icon', () => {
    const { useTheme } = require('@/lib/contexts/theme-context');
    useTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Current theme: light');
  });

  it('should render with dark theme icon', () => {
    const { useTheme } = require('@/lib/contexts/theme-context');
    useTheme.mockReturnValue({ theme: 'dark', setTheme: mockSetTheme });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Current theme: dark');
  });

  it('should render with system theme icon', () => {
    const { useTheme } = require('@/lib/contexts/theme-context');
    useTheme.mockReturnValue({ theme: 'system', setTheme: mockSetTheme });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Current theme: system');
  });

  it('should cycle from light to dark when clicked', () => {
    const { useTheme } = require('@/lib/contexts/theme-context');
    useTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should cycle from dark to system when clicked', () => {
    const { useTheme } = require('@/lib/contexts/theme-context');
    useTheme.mockReturnValue({ theme: 'dark', setTheme: mockSetTheme });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('should cycle from system to light when clicked', () => {
    const { useTheme } = require('@/lib/contexts/theme-context');
    useTheme.mockReturnValue({ theme: 'system', setTheme: mockSetTheme });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should be a ghost button with icon size', () => {
    const { useTheme } = require('@/lib/contexts/theme-context');
    useTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    // Button should have ghost variant and icon size classes
    expect(button.className).toContain('ghost');
  });

  it('should handle multiple clicks correctly', () => {
    const { useTheme } = require('@/lib/contexts/theme-context');
    useTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    
    // Click 3 times
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    // Should have been called 3 times
    expect(mockSetTheme).toHaveBeenCalledTimes(3);
  });
});
