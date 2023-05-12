import { render } from '__tests__/utils/setup-jest'
import BadgeDeploymentOrder from './badge-deployment-order'

describe('BadgeDeploymentOrder', () => {
  it('should render successfully', () => {
    const { baseElement, getByTestId } = render(<BadgeDeploymentOrder order={3} />)
    const badge = getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(baseElement).toBeTruthy()
  })

  it('should renders the badge with the default color when no order is provided', () => {
    const { getByTestId } = render(<BadgeDeploymentOrder order={3} />)
    const badge = getByTestId('badge')
    const badgeSvg = getByTestId('badge-svg')
    expect(badge).toBeInTheDocument()
    expect(badgeSvg).toBeInTheDocument()
    expect(badgeSvg).toHaveAttribute('fill', '#009EDD')
  })
})
