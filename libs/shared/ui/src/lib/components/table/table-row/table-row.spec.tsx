import { render } from '__tests__/utils/setup-jest'
import { screen } from '@testing-library/react'

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

  it('should have a link', () => {
    props.link = '/overview'

    render(<TableRow {...props} />)

    const row = screen.queryByTestId('row')

    expect(row).toHaveAttribute('href', '/overview')
  })

  it('should have a custom grid template columns', () => {
    props.columnsWidth = '33% 33% 33%'

    render(<TableRow {...props} />)

    const row = screen.queryByTestId('row')

    expect(row).toHaveStyle('grid-template-columns: 33% 33% 33%')
  })

  it('should have a custom class', () => {
    props.className = 'is-active'

    render(<TableRow {...props} />)

    const row = screen.queryByTestId('row')

    expect(row).toHaveClass('is-active')
  })
})
