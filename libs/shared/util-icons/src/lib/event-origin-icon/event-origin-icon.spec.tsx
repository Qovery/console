import { OrganizationEventOrigin } from 'qovery-typescript-axios'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { EventOriginIcon } from './event-origin-icon'

describe('EventOriginIcon', () => {
  it.each([
    [OrganizationEventOrigin.GIT, 'fa-code-branch'],
    [OrganizationEventOrigin.CONSOLE, 'fa-browser'],
    [OrganizationEventOrigin.QOVERY_INTERNAL, 'fa-wave-pulse'],
    [OrganizationEventOrigin.API, 'fa-cloud-arrow-up'],
    [OrganizationEventOrigin.CLI, 'fa-terminal'],
  ])('renders the correct icon for %s origins', (origin, iconClass) => {
    const { container } = renderWithProviders(<EventOriginIcon origin={origin} />)

    expect(container.querySelector(`.${iconClass}`)).toBeInTheDocument()
  })

  it('renders the Terraform icon for Terraform provider origins', () => {
    const { container } = renderWithProviders(<EventOriginIcon origin={OrganizationEventOrigin.TERRAFORM_PROVIDER} />)

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders nothing when the origin is unavailable', () => {
    const { container } = renderWithProviders(<EventOriginIcon />)

    expect(container).toBeEmptyDOMElement()
  })
})
