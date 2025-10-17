import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskTypeBadge from '../TaskTypeBadge';

describe('TaskTypeBadge', () => {
  test('renders text task badge correctly', () => {
    render(<TaskTypeBadge taskType="text" />);
    
    expect(screen.getByText('Zadanie tekstowe')).toBeInTheDocument();
    expect(screen.getByText('📄')).toBeInTheDocument();
  });

  test('renders python task badge correctly', () => {
    render(<TaskTypeBadge taskType="python" />);
    
    expect(screen.getByText('Zadanie Python')).toBeInTheDocument();
    expect(screen.getByText('💻')).toBeInTheDocument();
  });

  test('renders sql task badge correctly', () => {
    render(<TaskTypeBadge taskType="sql" />);
    
    expect(screen.getByText('Zadanie SQL')).toBeInTheDocument();
    expect(screen.getByText('🗄️')).toBeInTheDocument();
  });

  test('renders default badge for unknown task type', () => {
    render(<TaskTypeBadge taskType="unknown" />);
    
    expect(screen.getByText('Zadanie')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(<TaskTypeBadge taskType="text" className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
