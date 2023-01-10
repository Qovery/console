import { render } from '__tests__/utils/setup-jest'
import { mockEnvironmentVariable } from '@qovery/shared/factories'
import CrudEnvironmentVariableModalFeature, {
  CrudEnvironmentVariableModalFeatureProps,
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from './crud-environment-variable-modal-feature'

const props: CrudEnvironmentVariableModalFeatureProps = {
  mode: EnvironmentVariableCrudMode.CREATION,
  type: EnvironmentVariableType.ALIAS,
  projectId: 'dsd',
  applicationId: 'sds',
  environmentId: 'sds',
  variable: mockEnvironmentVariable(),
  setOpen: jest.fn(),
}

describe('CrudEnvironmentVariableModalFeature', () => {
  let baseElement: any

  it('should render successfully', () => {
    baseElement = render(<CrudEnvironmentVariableModalFeature {...props} />)

    expect(baseElement).toBeTruthy()
  })
})
