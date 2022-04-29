import { render } from '__tests__/utils/setup-jest'

import TableRow, { TableRowProps } from './table-row'

describe('TableRow', () => {
  let props: TableRowProps

  beforeEach(() => {
    props = {
      link: '/',
      children: <div>cell</div>,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<TableRow {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
