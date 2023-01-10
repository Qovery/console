import { render } from '__tests__/utils/setup-jest'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { environmentFactoryMock } from '@qovery/shared/factories'
import TableRowFilter, { TableRowFilterProps } from './table-row-filter'

describe('TableRowFilter', () => {
  let props: TableRowFilterProps

  beforeEach(() => {
    props = {
      data: environmentFactoryMock(1)[0],
      children: <div>row</div>,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<TableRowFilter {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should not render the row with filter', () => {
    const mockData = {
      mode: 'STAGING',
    }

    props.data = mockData
    props.filter = {
      key: 'mode',
      value: 'PRODUCTION',
    }

    const { baseElement } = render(<TableRowFilter {...props} />)
    expect(baseElement.textContent).toBe('')
  })

  it('should render the row with filter', () => {
    const mockData = {
      mode: 'STAGING',
    }

    props.data = mockData
    props.filter = {
      key: 'mode',
      value: 'STAGING',
    }

    const { baseElement } = render(<TableRowFilter {...props} />)
    expect(baseElement.textContent).toBe('row')
  })
})
