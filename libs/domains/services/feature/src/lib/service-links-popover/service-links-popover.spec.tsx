import { renderWithProviders } from '@qovery/shared/util-tests'
import ServiceLinksPopover from './service-links-popover'

describe('ServiceLinksPopover', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ServiceLinksPopover links={[]} />)
    expect(baseElement).toBeTruthy()
  })
  it('should match snapshot with button links', async () => {
    const { container } = renderWithProviders(
      <ServiceLinksPopover
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
