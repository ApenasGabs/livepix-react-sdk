import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LivePixButton from '../index';

// Mock do módulo createLivePix
jest.mock('../../../api/livePix', () => ({
  createLivePix: jest.fn().mockReturnValue({
    payments: {
      createPayment: jest.fn().mockResolvedValue({
        redirectUrl: 'https://payment-url.com'
      })
    }
  })
}));

describe('LivePixButton', () => {
  beforeEach(() => {
    // Limpar todos os mocks entre os testes
    jest.clearAllMocks();
    
    // Mock da função window.location.href
    Object.defineProperty(window, 'location', {
      value: {
        href: jest.fn()
      },
      writable: true
    });
  });
  
  it('renders correctly with default props', () => {
    render(<LivePixButton />);
    expect(screen.getByRole('button')).toHaveTextContent('Doar');
  });
  
  it('shows warning when credentials are not available', () => {
    render(<LivePixButton clientId="" clientSecret="" />);
    expect(screen.getByText(/credenciais da api não configuradas/i)).toBeInTheDocument();
  });
  
  it('shows custom label when provided', () => {
    render(<LivePixButton label="Doar R$ 5,00" />);
    expect(screen.getByRole('button')).toHaveTextContent('Doar R$ 5,00');
  });
  
  it('becomes disabled when disabled prop is true', () => {
    render(<LivePixButton disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('calls onClick callback when provided', async () => {
    const mockOnClick = jest.fn();
    render(<LivePixButton onClick={mockOnClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  it('redirects to payment URL when button is clicked', async () => {
    render(
      <LivePixButton 
        clientId="test-client-id" 
        clientSecret="test-client-secret"
        amount={1000}
        currency="BRL"
        redirectUrl="https://example.com/success" 
      />
    );
    
    await userEvent.click(screen.getByRole('button'));
    
    // Verifica se o redirecionamento ocorreu
    expect(window.location.href).toBe('https://payment-url.com');
  });
});