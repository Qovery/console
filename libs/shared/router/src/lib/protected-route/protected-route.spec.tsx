import { render } from '__tests__/utils/setup-jest'
import ProtectedRoute from '../protected-route/protected-route'

describe('ProtectedRoute', () => {
  const ProtectedComponent = () => {
    return <div>Protected componnent</div>
  }

  it('should render successfully', () => {
    const { baseElement } = render(<ProtectedRoute children={ProtectedComponent()} />)
    expect(baseElement).toBeTruthy()
  })
})
