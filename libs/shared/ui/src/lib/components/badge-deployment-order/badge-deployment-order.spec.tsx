import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import BadgeDeploymentOrder from './badge-deployment-order'

describe('BadgeDeploymentOrder', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<BadgeDeploymentOrder order={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(baseElement).toBeTruthy()
  })

  it('should renders the badge with the default color when no order is provided', () => {
    const { container } = renderWithProviders(<BadgeDeploymentOrder order={3} />)
    const badgeSvg = container.querySelector('svg')
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(badgeSvg).toBeInTheDocument()
  })
})
