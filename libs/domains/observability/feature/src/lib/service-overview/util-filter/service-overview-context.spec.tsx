import { render } from '@qovery/shared/util-tests'
import { useServiceOverviewContext } from './service-overview-context'

describe('ServiceOverviewContext', () => {
  it('should throw error when used outside provider', () => {
    const TestComponent = () => {
      useServiceOverviewContext()
      return <div>Test</div>
    }

    expect(() => render(<TestComponent />)).toThrow(
      'useServiceOverviewContext must be used within an ServiceOverviewProvider'
    )
  })
})
