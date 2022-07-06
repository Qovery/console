import TableRowEnvironmentVariableFeature, {
  TableRowEnvironmentVariableFeatureProps,
} from './table-row-environment-variable-feature'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { render } from '__tests__/utils/setup-jest'

const props: TableRowEnvironmentVariableFeatureProps = {
  variable: {
    key: '1',
    id: '1',
    created_at: new Date().toDateString(),
    scope: EnvironmentVariableScopeEnum.BUILT_IN,
    value: 'hey',
    service_name: 'console',
    updated_at: new Date().toDateString(),
    variable_type: 'public',
  },
  dataHead: [],
}

describe('TableRowEnvironmentVariableFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowEnvironmentVariableFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
