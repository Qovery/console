import { render } from '__tests__/utils/setup-jest'
import ProtectedRoute from './protected-route'

describe('ProtectedRoute', () => {
  const ProtectedComponent = () => {
    return <div>Protected component</div>
  }

  it('should render successfully', () => {
    const { baseElement } = render(<ProtectedRoute children={ProtectedComponent()} />)
    expect(baseElement).toBeTruthy()
  })
})
