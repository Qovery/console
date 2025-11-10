import { render } from '@qovery/shared/util-tests'
import { useDashboardContext } from './dashboard-context'

describe('useDashboardContext', () => {
  it('should throw error when used outside provider', () => {
    const TestComponent = () => {
      useDashboardContext()
      return <div>Test</div>
    }

    expect(() => render(<TestComponent />)).toThrow('useDashboardContext must be used within an DashboardProvider')
  })
})
