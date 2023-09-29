import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ServiceLinksPopover from './service-links-popover'

describe('ServiceLinksPopover', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ServiceLinksPopover links={[]} />)
    expect(baseElement).toBeTruthy()
  })
  it('should match snapshot', async () => {
    const { container, userEvent } = renderWithProviders(
      <ServiceLinksPopover
        links={[
          {
            url: 'https://qovery.com',
            internal_port: 8080,
          },
        ]}
      />,
      {
        container: document.body,
      }
    )
    const button = screen.getByRole('button', { name: /links/i })
    await userEvent.click(button)

    expect(container).toMatchSnapshot()
  })
})
