import { useContext } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceTerminalContext, ServiceTerminalProvider } from './service-terminal-provider'

const mockNavigate = jest.fn()
const mockUseLocation = jest.fn()
const mockUseSearch = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useLocation: () => mockUseLocation(),
  useNavigate: () => mockNavigate,
  useSearch: () => mockUseSearch(),
}))

function Consumer() {
  const { open, setOpen } = useContext(ServiceTerminalContext)

  return (
    <>
      <span>{open ? 'open' : 'closed'}</span>
      <button type="button" onClick={() => setOpen(false)}>
        close
      </button>
    </>
  )
}

describe('ServiceTerminalProvider', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockUseLocation.mockReturnValue({ pathname: '/service/overview', state: undefined })
    mockUseSearch.mockReturnValue({})
  })

  it('opens the terminal when hasShell is present in search params', () => {
    mockUseSearch.mockReturnValue({ hasShell: true })

    renderWithProviders(
      <ServiceTerminalProvider>
        <Consumer />
      </ServiceTerminalProvider>
    )

    expect(screen.getByText('open')).toBeInTheDocument()
  })

  it('removes hasShell from the url when the terminal closes', async () => {
    mockUseSearch.mockReturnValue({ hasShell: true })
    const { userEvent } = renderWithProviders(
      <ServiceTerminalProvider>
        <Consumer />
      </ServiceTerminalProvider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'close' }))

    expect(screen.getByText('closed')).toBeInTheDocument()
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/service/overview',
      search: {
        hasShell: undefined,
      },
    })
  })

  it('supports the legacy hasShell location state fallback', () => {
    mockUseLocation.mockReturnValue({ pathname: '/service/overview', state: { hasShell: true } })

    renderWithProviders(
      <ServiceTerminalProvider>
        <Consumer />
      </ServiceTerminalProvider>
    )

    expect(screen.getByText('open')).toBeInTheDocument()
  })
})
