import { render } from '__tests__/utils/setup-jest'
import DeploymentsFeature from './deployments-feature'

describe('Deployments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeploymentsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
