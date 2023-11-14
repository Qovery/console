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

jest.mock('../hooks/use-links/use-links', () => {
  return {
    ...jest.requireActual('../hooks/use-links/use-links'),
    useLinks: () => ({
      data: [
        {
          url: 'https://qovery.com',
          internal_port: 8080,
        },
      ],
    }),
  }
})

describe('ServiceLinksPopover', () => {
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
})
