import { render } from '@testing-library/react'

import InstancesTable from './instances-table'

describe('InstancesTable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InstancesTable />)
    expect(baseElement).toBeTruthy()
  })
})
