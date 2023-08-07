import { render } from '__tests__/utils/setup-jest'
import InstancesTable from './instances-table'

describe('InstancesTable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InstancesTable />)
    expect(baseElement).toBeTruthy()
  })
})
