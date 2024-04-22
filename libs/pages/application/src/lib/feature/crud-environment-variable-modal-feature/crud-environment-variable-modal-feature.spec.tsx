import { render } from '__tests__/utils/setup-jest'
import { mockEnvironmentVariable } from '@qovery/shared/factories'
import CrudEnvironmentVariableModalFeature, {
  type CrudEnvironmentVariableModalFeatureProps,
  EnvironmentVariableCrudMode,
} from './crud-environment-variable-modal-feature'

const props: CrudEnvironmentVariableModalFeatureProps = {
  mode: EnvironmentVariableCrudMode.CREATION,
  type: 'ALIAS',
  organizationId: 'dsd',
  projectId: 'dsd',
  applicationId: 'sds',
  environmentId: 'sds',
  variable: mockEnvironmentVariable(),
  closeModal: jest.fn(),
}

describe('CrudEnvironmentVariableModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CrudEnvironmentVariableModalFeature {...props} />)

    expect(baseElement).toBeTruthy()
  })
})
