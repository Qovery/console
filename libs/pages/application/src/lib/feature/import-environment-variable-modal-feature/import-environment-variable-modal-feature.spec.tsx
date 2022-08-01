import ImportEnvironmentVariableModalFeature from './import-environment-variable-modal-feature'
import { render } from '__tests__/utils/setup-jest'

describe('ImportEnvironmentVariableModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ImportEnvironmentVariableModalFeature />)
    expect(baseElement).toBeTruthy()
  })
})
