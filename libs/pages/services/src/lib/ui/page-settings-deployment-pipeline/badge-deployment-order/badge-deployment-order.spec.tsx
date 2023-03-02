import { render } from '__tests__/utils/setup-jest'
import BadgeDeploymentOrder, { getColorFromUID } from './badge-deployment-order'

describe('BadgeDeploymentOrder', () => {
  it('should render successfully', () => {
    const { baseElement, getByTestId } = render(<BadgeDeploymentOrder id="foo" />)
    const badge = getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(baseElement).toBeTruthy()
  })

  it('should renders the badge with the default color when no order is provided', () => {
    const { getByTestId } = render(<BadgeDeploymentOrder id="testuid" />)
    const badge = getByTestId('badge')
    const badgeSvg = getByTestId('badge-svg')
    expect(badge).toBeInTheDocument()
    expect(badgeSvg).toBeInTheDocument()
  })

  it('should renders the badge with a color from the `defaultColors`', () => {
    const { getByTestId } = render(<BadgeDeploymentOrder id="testuid" order={3} />)
    const badge = getByTestId('badge')
    expect(badge).toBeInTheDocument()
    const badgeSvg = getByTestId('badge-svg')
    const expectedColor = getColorFromUID('testuid', 3)
    expect(badgeSvg).toHaveAttribute('fill', expectedColor)
  })

  it('should returns the same color for the same uid and colorArray', () => {
    const result1 = getColorFromUID('testuid', 5)
    const result2 = getColorFromUID('testuid', 5)
    expect(result1).toBe(result2)
  })
})
