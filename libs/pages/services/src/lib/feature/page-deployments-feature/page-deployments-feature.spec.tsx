import { render } from '__tests__/utils/setup-jest'
import PageDeploymentsFeature from './page-deployments-feature'

describe('Deployments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageDeploymentsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
