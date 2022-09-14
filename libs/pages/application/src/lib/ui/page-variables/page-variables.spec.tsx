import { render } from '__tests__/utils/setup-jest'
import { secretEnvironmentVariableFactoryMock } from '@qovery/domains/environment-variable'
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
