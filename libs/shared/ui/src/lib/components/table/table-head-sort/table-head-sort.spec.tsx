import { render } from '__tests__/utils/setup-jest'
import { screen, fireEvent } from '@testing-library/react'
import TableHeadSort, { TableHeadSortProps, sortTable } from './table-head-sort'
import { environmentFactoryMock } from '@console/domains/environment'

describe('TableHeadSort', () => {
  let props: TableHeadSortProps

  beforeEach(() => {
    props = {
      title: 'Update',
      data: environmentFactoryMock(2),
      setFilterData: jest.fn(),
    }
  })
  it('should render successfully', () => {
    const { baseElement } = render(<TableHeadSort {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have a title', () => {
    props.title = 'title'

    render(<TableHeadSort {...props} />)

    const sort = screen.queryByTestId('table-head-sort')

    expect(sort?.textContent).toBe('title')
  })

  it('should have a rotate icon', () => {
    render(<TableHeadSort {...props} />)

    const sort = screen.queryByTestId('table-head-sort') as HTMLDivElement
    fireEvent.click(sort)

    const icon = sort.querySelector('.icon-solid-arrow-down')

    expect(icon).toHaveClass('rotate-180')
  })

  it('should have a sort function', () => {
    props.data = [
      {
        updated_at: new Date('2021-10-03'),
      },
      {
        updated_at: new Date('2022-04-14'),
      },
      {
        updated_at: new Date('2021-08-30'),
      },
    ]

    const sortFunction = sortTable(props.data)

    expect(sortFunction[0].updated_at.toString()).toBe(new Date('2022-04-14').toString())
  })
})
