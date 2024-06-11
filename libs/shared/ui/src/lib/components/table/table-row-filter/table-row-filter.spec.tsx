import { render } from '__tests__/utils/setup-jest'
// eslint-disable-next-line @nx/enforce-module-boundaries
import TableRowFilter from './table-row-filter'

describe('TableRowFilter', () => {
  it('should render children when filter matches', () => {
    const data = {
      status: {
        state: 'DEPLOYED',
      },
      mode: 'DEVELOPMENT',
    }

    const filter = [
      {
        key: 'status.state',
        value: 'DEPLOYED',
      },
      {
        key: 'mode',
        value: 'DEVELOPMENT',
      },
    ]

    const { getByText } = render(
      <TableRowFilter data={data} filter={filter}>
        <div>Filtered content</div>
      </TableRowFilter>
    )

    expect(getByText('Filtered content')).toBeInTheDocument()
  })

  it('should not render children when filter does not match', () => {
    const data = {
      status: {
        state: 'DEPLOYED',
      },
      mode: 'PRODUCTION',
    }

    const filter = [
      {
        key: 'status.state',
        value: 'DEPLOYED',
      },
      {
        key: 'mode',
        value: 'DEVELOPMENT',
      },
    ]

    const { queryByText } = render(
      <TableRowFilter data={data} filter={filter}>
        <div>Filtered content</div>
      </TableRowFilter>
    )

    expect(queryByText('Filtered content')).not.toBeInTheDocument()
  })
})
