import { render } from '__tests__/utils/setup-jest'
import BetaRoute from './beta-route'

describe('BetaRoute', () => {
  const ProtectedComponent = () => {
    return <div>Protected component</div>
  }

  it('should render successfully', () => {
    const { baseElement } = render(<BetaRoute children={ProtectedComponent()} />)
    expect(baseElement).toBeTruthy()
  })
})
