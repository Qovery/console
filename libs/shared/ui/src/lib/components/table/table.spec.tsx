import { render, screen, waitFor } from '__tests__/utils/setup-jest'
import Table, { type TableProps } from './table'

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

    expect(tableHeadTitle).not.toBeInTheDocument()
  })

  it('should sort by default key', async () => {
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

    const spy = jest.fn()
    render(<Table {...props} defaultSortingKey="name" setDataSort={spy} data={[{ name: 'b' }, { name: 'a' }]} />)

    await waitFor(() => {
      expect(spy).toHaveBeenCalled()
    })
  })
})
