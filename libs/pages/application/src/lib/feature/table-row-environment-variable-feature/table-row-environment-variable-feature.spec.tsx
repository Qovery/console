import { render } from '__tests__/utils/setup-jest'
import { mockSecretEnvironmentVariable } from '@qovery/shared/factories'
import TableRowEnvironmentVariableFeature, {
  TableRowEnvironmentVariableFeatureProps,
} from './table-row-environment-variable-feature'

const props: TableRowEnvironmentVariableFeatureProps = {
  variable: mockSecretEnvironmentVariable(false, false),
  dataHead: [],
  columnsWidth: '',
  isLoading: false,
}

describe('TableRowEnvironmentVariableFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableRowEnvironmentVariableFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
