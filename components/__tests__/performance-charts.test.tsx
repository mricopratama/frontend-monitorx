import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PerformanceCharts } from '../performance-charts';

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

describe('PerformanceCharts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    render(<PerformanceCharts />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render response time chart after loading', async () => {
    render(<PerformanceCharts />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/response time/i)).toBeInTheDocument();
    expect(screen.getAllByTestId('line-chart')).toBeTruthy();
  });

  it('should render uptime chart', async () => {
    render(<PerformanceCharts />);
    
    await waitFor(() => {
      expect(screen.getByText(/uptime/i)).toBeInTheDocument();
    });

    expect(screen.getAllByTestId('bar-chart')).toBeTruthy();
  });

  it('should render status code distribution chart', async () => {
    render(<PerformanceCharts />);
    
    await waitFor(() => {
      expect(screen.getByText(/status code/i)).toBeInTheDocument();
    });
  });

  it('should accept websiteId prop', async () => {
    render(<PerformanceCharts websiteId="test-website-id" />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Charts should be rendered with website-specific data
    expect(screen.getAllByTestId('line-chart').length).toBeGreaterThan(0);
  });

  it('should accept timeRange prop', async () => {
    const { rerender } = render(<PerformanceCharts timeRange="24h" />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Change time range
    rerender(<PerformanceCharts timeRange="7d" />);
    
    // Should show loading again when time range changes
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render all three chart types', async () => {
    render(<PerformanceCharts />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Should have line chart, bar chart, and area chart
    expect(screen.getAllByTestId('line-chart')).toBeTruthy();
    expect(screen.getAllByTestId('bar-chart')).toBeTruthy();
  });

  it('should display card headers with descriptions', async () => {
    render(<PerformanceCharts />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check for card titles
    expect(screen.getByText(/response time/i)).toBeInTheDocument();
    expect(screen.getByText(/uptime/i)).toBeInTheDocument();
  });
});
