import { render } from '__tests__/utils/setup-jest'
import TableRowFilter, { TableRowFilterProps } from './table-row-filter'

describe('TableRowFilter', () => {
  let props: TableRowFilterProps

  beforeEach(() => {
    props = {
      children: <div>cell</div>,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<TableRowFilter {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
