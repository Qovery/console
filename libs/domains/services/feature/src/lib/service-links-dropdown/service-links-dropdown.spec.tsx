import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ServiceLinksDropdown from './service-links-dropdown'

describe('ServiceLinksDropdown', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ServiceLinksDropdown links={[]} />)
    expect(baseElement).toBeTruthy()
  })
  it('should match snapshot with links popover', async () => {
    const { userEvent, container } = renderWithProviders(
      <ServiceLinksDropdown
        links={[
          {
            url: 'https://qovery.com',
            internal_port: 8080,
          },
        ]}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Links' }))

    expect(container).toMatchSnapshot()
  })
})
