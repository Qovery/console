import { getByText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { APIVariableTypeEnum } from 'qovery-typescript-axios'
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

  describe('variable is file', () => {
    beforeEach(() => {
      props.variable = {
        ...props.variable,
        mount_path: '/path/to/file',
        variable_type: APIVariableTypeEnum.FILE,
      }
    })

    it('should render the path of the file', () => {
      const { baseElement } = render(<TableRowEnvironmentVariable {...props} />)
      getByText(baseElement, '/path/to/file')
    })
  })
})
