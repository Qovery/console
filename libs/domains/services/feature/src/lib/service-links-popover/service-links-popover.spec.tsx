import { renderWithProviders } from '@qovery/shared/util-tests'
import ServiceLinksDropdown from './service-links-dropdown'

describe('ServiceLinksDropdown', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ServiceLinksDropdown links={[]} />)
    expect(baseElement).toBeTruthy()
  })
  it('should match snapshot with button links', async () => {
    const { container } = renderWithProviders(
      <ServiceLinksDropdown
        links={[
          {
            url: 'https://qovery.com',
            internal_port: 8080,
          },
        ]}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
