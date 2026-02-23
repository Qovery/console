import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ServiceLinksPopover from './service-links-popover'

jest.mock('../hooks/use-service-type/use-service-type', () => {
  return {
    ...jest.requireActual('../hooks/use-service-type/use-service-type'),
    useServiceType: () => ({
      data: 'APPLICATION',
    }),
  }
})

const mockUseLinks = jest.fn()

jest.mock('../hooks/use-env-links/use-env-links', () => {
  return {
    ...jest.requireActual('../hooks/use-env-links/use-env-links'),
    useEnvironmentLinks: () => mockUseLinks(),
  }
})

describe('ServiceLinksPopover', () => {
  beforeEach(() => {
    mockUseLinks.mockReturnValue({
      data: [
        {
          url: 'https://qovery.com',
          internal_port: 8080,
        },
      ],
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ServiceLinksPopover>
        <button>links</button>
      </ServiceLinksPopover>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', async () => {
    const { container, userEvent } = renderWithProviders(
      <ServiceLinksPopover>
        <button>links</button>
      </ServiceLinksPopover>,
      {
        container: document.body,
      }
    )
    const button = screen.getByRole('button', { name: /links/i })
    await userEvent.click(button)

    expect(container).toMatchSnapshot()
  })

  describe('Gateway API / Envoy stack separator', () => {
    it('should show divider and label when both nginx and gateway-api links exist', async () => {
      mockUseLinks.mockReturnValue({
        data: [
          {
            url: 'https://nginx.qovery.com',
            internal_port: 8080,
          },
          {
            url: 'https://gateway-api.qovery.com',
            internal_port: 8081,
          },
        ],
      })

      const { userEvent } = renderWithProviders(
        <ServiceLinksPopover>
          <button>links</button>
        </ServiceLinksPopover>,
        {
          container: document.body,
        }
      )

      const button = screen.getByRole('button', { name: /links/i })
      await userEvent.click(button)

      expect(screen.getByText('Gateway API / Envoy stack')).toBeInTheDocument()
      expect(screen.getByText('https://nginx.qovery.com')).toBeInTheDocument()
      // Check by href since the URL might be truncated in the display
      const links = screen.getAllByRole('link')
      const gatewayApiLink = links.find((link) => link.getAttribute('href') === 'https://gateway-api.qovery.com')
      expect(gatewayApiLink).toBeTruthy()
    })

    it('should not show divider when only nginx links exist', async () => {
      mockUseLinks.mockReturnValue({
        data: [
          {
            url: 'https://nginx1.qovery.com',
            internal_port: 8080,
          },
          {
            url: 'https://nginx2.qovery.com',
            internal_port: 8081,
          },
        ],
      })

      const { userEvent } = renderWithProviders(
        <ServiceLinksPopover>
          <button>links</button>
        </ServiceLinksPopover>,
        {
          container: document.body,
        }
      )

      const button = screen.getByRole('button', { name: /links/i })
      await userEvent.click(button)

      expect(screen.queryByText('Gateway API / Envoy stack')).not.toBeInTheDocument()
      expect(screen.getByText('https://nginx1.qovery.com')).toBeInTheDocument()
      expect(screen.getByText('https://nginx2.qovery.com')).toBeInTheDocument()
    })

    it('should not show divider when only gateway-api links exist', async () => {
      mockUseLinks.mockReturnValue({
        data: [
          {
            url: 'https://gateway-api-1.qovery.com',
            internal_port: 8080,
          },
          {
            url: 'https://gateway-api-2.qovery.com',
            internal_port: 8081,
          },
        ],
      })

      const { userEvent } = renderWithProviders(
        <ServiceLinksPopover>
          <button>links</button>
        </ServiceLinksPopover>,
        {
          container: document.body,
        }
      )

      const button = screen.getByRole('button', { name: /links/i })
      await userEvent.click(button)

      expect(screen.queryByText('Gateway API / Envoy stack')).not.toBeInTheDocument()
      const links = screen.getAllByRole('link')
      expect(links[1]).toHaveAttribute('href', 'https://gateway-api-1.qovery.com')
      expect(links[2]).toHaveAttribute('href', 'https://gateway-api-2.qovery.com')
    })

    it('should render links in correct order: nginx first, then gateway-api', async () => {
      mockUseLinks.mockReturnValue({
        data: [
          {
            url: 'https://gateway-api.qovery.com',
            internal_port: 8081,
          },
          {
            url: 'https://nginx.qovery.com',
            internal_port: 8080,
          },
        ],
      })

      const { userEvent } = renderWithProviders(
        <ServiceLinksPopover>
          <button>links</button>
        </ServiceLinksPopover>,
        {
          container: document.body,
        }
      )

      const button = screen.getByRole('button', { name: /links/i })
      await userEvent.click(button)

      const links = screen.getAllByRole('link')
      expect(links[1]).toHaveAttribute('href', 'https://nginx.qovery.com')
      expect(links[2]).toHaveAttribute('href', 'https://gateway-api.qovery.com')
    })
  })
})
