import { applicationFactoryMock } from '@console/domains/application'
import { render } from '__tests__/utils/setup-jest'

import TableRowApplications, { TableRowApplicationsProps } from './table-row-applications'

let props: TableRowApplicationsProps

beforeEach(() => {
  props = {
    data: applicationFactoryMock(1)[0],
    dataHead: [],
    link: '/',
  }
})

describe('TableRowApplications', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowApplications {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
