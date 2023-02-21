import { render } from '@testing-library/react'
import BadgeDeploymentOrder, { BadgeDeploymentOrderProps } from './badge-deployment-order'

const props: BadgeDeploymentOrderProps = {
  deploymentOrder: 1,
}

describe('BadgeDeploymentOrder', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BadgeDeploymentOrder {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have an deployment order', () => {
    const { getByTestId } = render(<BadgeDeploymentOrder {...props} />)
    expect(getByTestId('badge').textContent).toBe('1')
  })
})
