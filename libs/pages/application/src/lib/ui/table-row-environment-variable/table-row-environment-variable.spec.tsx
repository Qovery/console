import { render } from '__tests__/utils/setup-jest'
import { mockEnvironmentVariable } from '@qovery/shared/factories'
import TableRowEnvironmentVariable, { TableRowEnvironmentVariableProps } from './table-row-environment-variable'

const props: TableRowEnvironmentVariableProps = {
  variable: mockEnvironmentVariable(false, false),
  rowActions: [],
  isLoading: false,
  dataHead: [],
}

describe('TableRowEnvironmentVariable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowEnvironmentVariable {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
