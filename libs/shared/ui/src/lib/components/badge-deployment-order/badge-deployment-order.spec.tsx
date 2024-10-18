import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import BadgeDeploymentOrder from './badge-deployment-order'

describe('BadgeDeploymentOrder', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<BadgeDeploymentOrder order={3} />)
    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(baseElement).toBeTruthy()
  })

  it('should renders the badge with the default color when no order is provided', () => {
    renderWithProviders(<BadgeDeploymentOrder order={3} />)
    const badge = screen.getByTestId('badge')
    const badgeSvg = screen.getByTestId('badge-svg')
    expect(badge).toBeInTheDocument()
    expect(badgeSvg).toBeInTheDocument()
  })
})
