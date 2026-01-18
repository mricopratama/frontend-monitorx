import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  LoadingFallback, 
  DashboardCardSkeleton, 
  TableRowSkeleton 
} from '../loading-fallback';

describe('LoadingFallback', () => {
  it('should render loading spinner', () => {
    render(<LoadingFallback />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render custom loading message', () => {
    render(<LoadingFallback message="Fetching data..." />);
    
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('should render in full screen mode', () => {
    const { container } = render(<LoadingFallback fullScreen={true} />);
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('min-h-screen');
  });

  it('should render in inline mode by default', () => {
    const { container } = render(<LoadingFallback />);
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toContain('min-h-screen');
  });

  it('should display spinning loader icon', () => {
    const { container } = render(<LoadingFallback />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should be centered', () => {
    const { container } = render(<LoadingFallback />);
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('items-center');
    expect(wrapper.className).toContain('justify-center');
  });
});

describe('DashboardCardSkeleton', () => {
  it('should render skeleton card', () => {
    const { container } = render(<DashboardCardSkeleton />);
    
    const card = container.querySelector('.bg-card');
    expect(card).toBeInTheDocument();
  });

  it('should have animation pulse effect', () => {
    const { container } = render(<DashboardCardSkeleton />);
    
    const card = container.querySelector('.animate-pulse');
    expect(card).toBeInTheDocument();
  });

  it('should render skeleton lines', () => {
    const { container } = render(<DashboardCardSkeleton />);
    
    const skeletonElements = container.querySelectorAll('.bg-secondary');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should have proper card styling', () => {
    const { container } = render(<DashboardCardSkeleton />);
    
    const card = container.querySelector('.rounded-lg');
    expect(card).toBeInTheDocument();
  });
});

describe('TableRowSkeleton', () => {
  it('should render table row', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton />
        </tbody>
      </table>
    );
    
    const row = container.querySelector('tr');
    expect(row).toBeInTheDocument();
  });

  it('should render default 5 columns', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton />
        </tbody>
      </table>
    );
    
    const cells = container.querySelectorAll('td');
    expect(cells.length).toBe(5);
  });

  it('should render custom number of columns', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton columns={3} />
        </tbody>
      </table>
    );
    
    const cells = container.querySelectorAll('td');
    expect(cells.length).toBe(3);
  });

  it('should have animation pulse effect', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton />
        </tbody>
      </table>
    );
    
    const row = container.querySelector('.animate-pulse');
    expect(row).toBeInTheDocument();
  });

  it('should render skeleton content in cells', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton columns={2} />
        </tbody>
      </table>
    );
    
    const skeletonElements = container.querySelectorAll('td');
    expect(skeletonElements.length).toBe(2);
  });

  it('should have border styling', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton />
        </tbody>
      </table>
    );
    
    const row = container.querySelector('.border-b');
    expect(row).toBeInTheDocument();
  });

  it('should support multiple rows', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </tbody>
      </table>
    );
    
    const rows = container.querySelectorAll('tr');
    expect(rows.length).toBe(3);
  });
});
