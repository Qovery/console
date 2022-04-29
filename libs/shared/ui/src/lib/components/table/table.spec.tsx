import { render } from '__tests__/utils/setup-jest'

import Table, { TableProps } from './table'

describe('Table', () => {
  let props: TableProps

  beforeEach(() => {
    props = {
      dataHead: [
        {
          title: 'Environment',
          className: 'px-4 py-2',
        },
      ],
      children: <div>row</div>,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Table {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
