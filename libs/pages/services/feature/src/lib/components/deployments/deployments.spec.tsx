import { render } from '__tests__/utils/setup-jest'
import Deployments from './deployments'

describe('Deployments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Deployments />)
    expect(baseElement).toBeTruthy()
  })
})
