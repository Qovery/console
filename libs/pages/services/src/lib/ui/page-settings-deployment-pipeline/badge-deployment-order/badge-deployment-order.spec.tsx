import { render } from '__tests__/utils/setup-jest'
import BadgeDeploymentOrder, { colors } from './badge-deployment-order'

describe('BadgeDeploymentOrder', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BadgeDeploymentOrder />)
    expect(baseElement).toBeTruthy()
  })

  test('should render the badge with the deployment order', () => {
    const { getByTestId } = render(<BadgeDeploymentOrder deploymentOrder={2} />)
    const badge = getByTestId('badge')
    const badgeSvg = getByTestId('badge-svg')

    expect(badgeSvg).toHaveAttribute('fill', colors[2]) // color for deployment order 2
    expect(badge.textContent).toBe('2')
  })

  test('should render the badge with a random color for deployment orders greater than the number of colors', () => {
    const { getByTestId } = render(<BadgeDeploymentOrder deploymentOrder={3} />)
    const badge = getByTestId('badge')
    const badgeSvg = getByTestId('badge-svg')

    expect(badgeSvg).toHaveAttribute('fill', colors[5]) // color for deployment order 5
    expect(badge.textContent).toBe('3')
  })

  test('should render the badge with the default deployment order of 0 if no deployment order is provided', () => {
    const { getByTestId } = render(<BadgeDeploymentOrder />)
    const badge = getByTestId('badge')
    const badgeSvg = getByTestId('badge-svg')

    expect(badgeSvg).toHaveAttribute('fill', colors[0]) // color for deployment order 0
    expect(badge.textContent).toBe('0')
  })
})
