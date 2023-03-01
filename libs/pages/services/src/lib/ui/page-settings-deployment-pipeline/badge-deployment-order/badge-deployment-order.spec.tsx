import { render } from '__tests__/utils/setup-jest'
import BadgeDeploymentOrder, { colors, defaultColors, getColorFromUID } from './badge-deployment-order'

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
    expect(badgeSvg).toHaveAttribute('fill', defaultColors[0])
  })

  it('should renders the badge with a color from the `defaultColors` array when order is less than 4', () => {
    const { getByTestId } = render(<BadgeDeploymentOrder id="testuid" order={3} />)
    const badge = getByTestId('badge')
    expect(badge).toBeInTheDocument()
    const badgeSvg = getByTestId('badge-svg')
    const expectedColor = getColorFromUID('testuid', 3)
    expect(badgeSvg).toHaveAttribute('fill', expectedColor)
  })

  it('should returns a color from the array for order >= 5', () => {
    const result = getColorFromUID('testuid', 5)
    expect(colors).toContain(result)
  })

  it('should returns the same color for the same uid and colorArray', () => {
    const result1 = getColorFromUID('testuid', 5)
    const result2 = getColorFromUID('testuid', 5)
    expect(result1).toBe(result2)
  })
})
