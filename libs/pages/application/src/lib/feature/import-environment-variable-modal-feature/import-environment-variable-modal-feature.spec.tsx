import ImportEnvironmentVariableModalFeature, {
  ImportEnvironmentVariableModalFeatureProps,
} from './import-environment-variable-modal-feature'
import { render } from '__tests__/utils/setup-jest'

describe('ImportEnvironmentVariableModalFeature', () => {
  const props: ImportEnvironmentVariableModalFeatureProps = {
    applicationId: '123',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<ImportEnvironmentVariableModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
