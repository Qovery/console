import { render } from '@qovery/shared/util-tests'
import { useRdsManagedDbContext } from './rds-managed-db-context'

describe('RdsManagedDbContext', () => {
  it('should throw error when used outside provider', () => {
    const TestComponent = () => {
      useRdsManagedDbContext()
      return <div>Test</div>
    }

    expect(() => render(<TestComponent />)).toThrow(
      'useRdsManagedDbContext must be used within an RdsManagedDbProvider'
    )
  })
})
