import { render } from '__tests__/utils/setup-jest'
import TableEdition, { type TableEditionProps } from './table-edition'

const props: TableEditionProps = {
  tableBody: [
    {
      cells: [{ content: 'Cell 1', className: 'special-cell-test' }, { content: 'Cell 2' }, { content: 'Cell 3' }],
      className: 'font-medium special-test',
    },
    {
      cells: [{ content: 'Cell 4' }, { content: 'Cell 5' }, { content: 'Cell 6' }],
      className: 'font-medium',
    },
    {
      cells: [{ content: 'Cell 71' }, { content: 'Cell 8' }, { content: 'Cell 9' }],
      className: 'font-medium',
    },
  ],
}

describe('TableEdition', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableEdition {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render 3 rows and 9 cells', () => {
    const { getAllByTestId } = render(<TableEdition {...props} />)
    expect(getAllByTestId('edition-table-row').length).toBe(3)
    expect(getAllByTestId('edition-table-cell').length).toBe(9)
  })

  it('row should have custom classNames', () => {
    const { getAllByTestId } = render(<TableEdition {...props} />)
    const rows = getAllByTestId('edition-table-row')
    expect(rows[0]).toHaveClass('special-test')
  })

  it('cell should have custom classNames', () => {
    const { getAllByTestId } = render(<TableEdition {...props} />)
    const cells = getAllByTestId('edition-table-cell')
    expect(cells[0]).toHaveClass('special-cell-test')
  })

  it('last cell should not have border right and other should', () => {
    const { getAllByTestId } = render(<TableEdition {...props} />)
    const cells = getAllByTestId('edition-table-cell')
    expect(cells[0]).toHaveClass('border-r')
    expect(cells[1]).toHaveClass('border-r')
    expect(cells[2]).not.toHaveClass('border-r')
  })

  it('last row should not have border bottom and other should', () => {
    const { getAllByTestId } = render(<TableEdition {...props} />)
    const rows = getAllByTestId('edition-table-row')
    expect(rows[0]).toHaveClass('border-b')
    expect(rows[1]).toHaveClass('border-b')
    expect(rows[2]).not.toHaveClass('border-b')
  })
})
