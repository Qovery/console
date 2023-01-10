import { render } from '__tests__/utils/setup-jest'
import { secretEnvironmentVariableFactoryMock } from '@qovery/shared/factories'
import PageVariables, { PageVariablesProps } from './page-variables'

const props: PageVariablesProps = {
  variables: secretEnvironmentVariableFactoryMock(3, false, false),
  filterData: secretEnvironmentVariableFactoryMock(3, false, false),
  listHelpfulLinks: [],
  setFilterData: () => {},
  tableHead: [],
}

describe('PageVariables', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageVariables {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
