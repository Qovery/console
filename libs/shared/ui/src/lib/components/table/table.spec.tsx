import { screen } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import Table, { TableProps } from './table'

describe('Table', () => {
  let props: TableProps

  beforeEach(() => {
    props = {
      dataHead: [],
      children: <div>row</div>,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Table {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have a custom grid template columns', () => {
    props.columnsWidth = '33% 33% 33%'

    render(<Table {...props} />)

    const tableContainer = screen.queryByTestId('table-container')

    expect(tableContainer).toHaveStyle('grid-template-columns: 33% 33% 33%')
  })

  it('should have a head title', () => {
    props.dataHead = [
      {
        title: 'Title',
      },
    ]

    render(<Table {...props} />)

    const tableHeadTitle = screen.queryByTestId('table-head-title')

    expect(tableHeadTitle?.textContent).toBe('Title')
  })

  it('should have a head filter', () => {
    props.dataHead = [
      {
        title: 'Title',
        filter: [
          {
            key: 'mode',
          },
        ],
      },
    ]

    render(<Table {...props} />)

    const tableHeadTitle = screen.queryByTestId('table-head-title')

    expect(tableHeadTitle).toBeNull()
  })
})
