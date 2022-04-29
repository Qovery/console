import { environmentFactoryMock } from '@console/domains/environment'
import { render } from '__tests__/utils/setup-jest'

import TableRowEnvironments, { TableRowEnvironmentsProps } from './table-row-environments'

describe('TableRowEnvironments', () => {
  let props: TableRowEnvironmentsProps

  beforeEach(() => {
    props = {
      data: environmentFactoryMock(1)[0],
      dataHead: [],
      link: '/',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<TableRowEnvironments {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
