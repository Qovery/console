import { render } from '__tests__/utils/setup-jest'
import Table, { type TableProps } from './table'

const props: TableProps = {
  title: 'test',
  headArray: [
    {
      label: 'hello',
      tooltip: 'tooltip',
    },
    {
      label: 'hello-2',
      tooltip: 'tooltip-2',
    },
  ],
  children: <p>children</p>,
}

describe('Table', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Table {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have a label', () => {
    const { getByText } = render(<Table {...props} />)

    getByText('hello')
    getByText('hello-2')
  })
})
